import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ratelimit, getClientIP } from '@/lib/ratelimit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Allowed fields for profile updates (matches actual database columns)
const ALLOWED_UPDATE_FIELDS = new Set([
  "bio", "profession", "education", "location", "gothra", "nakshatra",
  "sub_community", "diet", "height", "weight", "employer", "visa_status"
]);

// 1. DEFINE THE TOOLS (The "Hands")
// These are the capabilities we expose to the AI.
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "update_profile",
      description: "Update a specific field in the user's matrimonial profile database.",
      parameters: {
        type: "object",
        properties: {
          field: {
            type: "string",
            enum: ["bio", "profession", "education", "location", "gothra", "nakshatra", "sub_community", "diet", "height", "weight", "employer", "visa_status"],
            description: "The database column to update."
          },
          value: {
            type: "string",
            description: "The new value to write to the database."
          }
        },
        required: ["field", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_matches",
      description: "Search for other user profiles based on criteria like profession, age, gothra, or location.",
      parameters: {
        type: "object",
        properties: {
          profession: { type: "string", description: "Filter by job title (e.g. Doctor, Engineer)" },
          gothra: { type: "string", description: "Filter by Gothra/Lineage" },
          location: { type: "string", description: "Filter by city or location" },
          min_age: { type: "integer", description: "Minimum age" },
          max_age: { type: "integer", description: "Maximum age" }
        },
        required: []
      }
    }
  }
];

export async function POST(request: Request) {
  try {
    // ── Rate limit check (fast Redis call — runs before any DB or AI work) ──
    const ip = getClientIP(request);
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const supabase = await createClient();

    // Security Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, contextPath } = await request.json();

    // 2. DEFINE THE PERSONA
    const systemPrompt = `
      You are "Sutradhar", the intelligent agent for Pravara Matrimony.
      Context: User is currently on ${contextPath}.
      
      RULES:
      - If the user asks to change/update their profile (e.g., "Change my job to Banker"), USE THE 'update_profile' TOOL.
      - If the user asks for advice, just answer normally.
      - Be polite, Vedic, and concise.
    `;

    // 3. FIRST CALL: ASK AI WHAT TO DO
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      tools: tools,
      tool_choice: "auto", // Let AI decide if it needs a tool or just talk
    });

    const choice = completion.choices[0].message;

    // 4. CASE A: AI WANTS TO TALK (No Tool Used)
    if (!choice.tool_calls) {
      return NextResponse.json({ reply: choice.content });
    }

    // 5. CASE B: AI WANTS TO ACT (Tool Used)
    const toolCall = choice.tool_calls[0];

    // Type guard: ensure it's a function tool call
    if (toolCall.type !== 'function') {
      return NextResponse.json({ reply: "I received an unexpected response format." });
    }

    if (toolCall.function.name === "update_profile") {
      const args = JSON.parse(toolCall.function.arguments);

      // Safety check: validate field is allowed
      if (!ALLOWED_UPDATE_FIELDS.has(args.field)) {
        console.warn(`Sutradhar blocked invalid field: ${args.field}`);
        return NextResponse.json({ reply: `I cannot update the field "${args.field}". Please ask me to update a valid profile field.` });
      }

      console.log(`🤖 Sutradhar Action: Updating ${args.field} to ${args.value}`);

      // EXECUTE THE DATABASE UPDATE
      const { error } = await supabase
        .from('profiles')
        .update({ [args.field]: args.value })
        .eq('id', user.id);

      if (error) {
        console.error("Sutradhar DB Error:", error);
        return NextResponse.json({ reply: "I tried to update your profile, but the stars were not aligned (Database Error)." });
      }

      // Return success message
      return NextResponse.json({
        reply: `Done! I have successfully updated your ${args.field} to \"${args.value}\".`
      });
    }
    // HANDLE SEARCH
    else if (toolCall.function.name === "search_matches") {
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`🤖 Sutradhar Searching:`, args);

      // 1. Build the Query (exclude current user)
      let query = supabase
        .from('profiles')
        .select('full_name, profession, age, gothra, location, id')
        .neq('id', user.id);

      if (args.profession) query = query.ilike('profession', `%${args.profession}%`);
      if (args.gothra) query = query.ilike('gothra', `%${args.gothra}%`);
      if (args.location) query = query.ilike('location', `%${args.location}%`);
      if (args.min_age) query = query.gte('age', args.min_age);
      if (args.max_age) query = query.lte('age', args.max_age);

      // 2. Execute
      const { data: matches, error } = await query.limit(5);

      if (error) {
        console.error("Search Error:", error);
        return NextResponse.json({ reply: "I tried to look for matches, but my vision is clouded (Database Error)." });
      }

      if (!matches || matches.length === 0) {
        return NextResponse.json({ reply: "I searched far and wide, but found no profiles matching those specific criteria." });
      }

      // 3. Format the Results for the Chat
      const resultString = matches.map((m: { full_name: string; age: number | null; profession: string | null; gothra: string | null; location: string | null }) =>
        `- ${m.full_name} (${m.age || 'N/A'}, ${m.profession || 'N/A'}, ${m.location || 'N/A'})`
      ).join('\n');

      return NextResponse.json({
        reply: `Here are the matches I found for you:\n\n${resultString}\n\nShall I send a connection request to any of them?`
      });
    }

    return NextResponse.json({ reply: "I am not sure how to do that yet." });

  } catch (error: any) {
    console.error('Sutradhar Brain Error:', error);
    return NextResponse.json({ reply: "My connection to the divine cloud is interrupted." }, { status: 500 });
  }
}
