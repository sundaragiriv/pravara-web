import { NextResponse } from "next/server";
import OpenAI from "openai";

import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText, sanitizeProfileValue } from "@/lib/sanitize";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ALLOWED_UPDATE_FIELDS = new Set([
  "bio",
  "profession",
  "education",
  "location",
  "gothra",
  "nakshatra",
  "sub_community",
  "diet",
  "height",
  "weight",
  "employer",
  "visa_status",
]);

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
            enum: [
              "bio",
              "profession",
              "education",
              "location",
              "gothra",
              "nakshatra",
              "sub_community",
              "diet",
              "height",
              "weight",
              "employer",
              "visa_status",
            ],
            description: "The database column to update.",
          },
          value: {
            type: "string",
            description: "The new value to write to the database.",
          },
        },
        required: ["field", "value"],
      },
    },
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
          max_age: { type: "integer", description: "Maximum age" },
        },
        required: [],
      },
    },
  },
];

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(request, RATE_LIMITS.sutradhar, `user:${user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before sending another message." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const { message, contextPath } = await request.json();
    const sanitizedMessage = sanitizePlainText(String(message ?? ""));
    const sanitizedContextPath = sanitizePlainText(String(contextPath ?? "/"));

    const systemPrompt = `
      You are "Sutradhar", the intelligent agent for Pravara Matrimony.
      Context: User is currently on ${sanitizedContextPath}.

      RULES:
      - If the user asks to change or update their profile, use the "update_profile" tool.
      - If the user asks for advice, answer normally.
      - Be polite, Vedic, and concise.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sanitizedMessage },
      ],
      tools,
      tool_choice: "auto",
    });

    const choice = completion.choices[0]?.message;

    if (!choice?.tool_calls?.length) {
      return NextResponse.json({ reply: choice?.content ?? "I am here." });
    }

    const toolCall = choice.tool_calls[0];
    if (toolCall.type !== "function") {
      return NextResponse.json({ reply: "I received an unexpected response format." });
    }

    if (toolCall.function.name === "update_profile") {
      const args = JSON.parse(toolCall.function.arguments) as { field?: string; value?: string };

      if (!args.field || !ALLOWED_UPDATE_FIELDS.has(args.field)) {
        return NextResponse.json({
          reply: `I cannot update the field "${args.field ?? "unknown"}". Please ask me to update a valid profile field.`,
        });
      }

      const cleanValue = sanitizeProfileValue(args.value ?? "");
      const { error } = await supabase
        .from("profiles")
        .update({ [args.field]: cleanValue })
        .eq("id", user.id);

      if (error) {
        console.error("Sutradhar DB Error:", error);
        return NextResponse.json({
          reply: "I tried to update your profile, but the stars were not aligned.",
        });
      }

      return NextResponse.json({
        reply: `Done. I updated your ${args.field} to "${String(cleanValue)}".`,
      });
    }

    if (toolCall.function.name === "search_matches") {
      const args = JSON.parse(toolCall.function.arguments) as {
        profession?: string;
        gothra?: string;
        location?: string;
        min_age?: number;
        max_age?: number;
      };

      let query = supabase
        .from("profiles")
        .select("full_name, profession, age, gothra, location, id")
        .neq("id", user.id);

      if (args.profession) query = query.ilike("profession", `%${sanitizePlainText(args.profession)}%`);
      if (args.gothra) query = query.ilike("gothra", `%${sanitizePlainText(args.gothra)}%`);
      if (args.location) query = query.ilike("location", `%${sanitizePlainText(args.location)}%`);
      if (args.min_age) query = query.gte("age", args.min_age);
      if (args.max_age) query = query.lte("age", args.max_age);

      const { data: matches, error } = await query.limit(5);
      if (error) {
        console.error("Search Error:", error);
        return NextResponse.json({
          reply: "I tried to look for matches, but my vision is clouded.",
        });
      }

      if (!matches?.length) {
        return NextResponse.json({
          reply: "I searched far and wide, but found no profiles matching those criteria.",
        });
      }

      const resultString = matches
        .map(
          (match: {
            full_name: string;
            age: number | null;
            profession: string | null;
            location: string | null;
          }) =>
            `- ${match.full_name} (${match.age || "N/A"}, ${match.profession || "N/A"}, ${match.location || "N/A"})`
        )
        .join("\n");

      return NextResponse.json({
        reply: `Here are the matches I found for you:\n\n${resultString}\n\nShall I send a connection request to any of them?`,
      });
    }

    return NextResponse.json({ reply: "I am not sure how to do that yet." });
  } catch (error) {
    console.error("Sutradhar Brain Error:", error);
    return NextResponse.json(
      { reply: "My connection to the divine cloud is interrupted." },
      { status: 500 }
    );
  }
}
