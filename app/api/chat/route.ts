import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Admin client to update DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { messages, userId, currentProfile } = await req.json(); // Accept currentProfile

    // 1. Define Tools
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "update_profile",
          description: "Save user information (Name, Gothra, Preferences)",
          parameters: {
            type: "object",
            properties: {
              full_name: { type: "string" },
              gothra: { type: "string" },
              partner_preferences: { type: "string" },
            },
          },
        },
      },
      {
        type: "function" as const,
        function: {
            name: "complete_onboarding",
            description: "Call this ONLY when you have Name, Gothra, and Preferences.",
            parameters: { type: "object", properties: {} }, 
        }
      }
    ];

    // 2. System Prompt with Context Awareness
    const systemPrompt = `
      You are Pravara, a digital Sutradhar.
      
      KNOWN INFORMATION SO FAR:
      Name: ${currentProfile?.full_name || "Unknown"}
      Gothra: ${currentProfile?.gothra || "Unknown"}
      Preferences: ${currentProfile?.partner_preferences || "Unknown"}

      Goal: Collect any MISSING information (Name, Gothra, Preferences).
      
      Rules:
      - If Name is known, DO NOT ask for it again.
      - If Gothra is known, DO NOT ask for it again.
      - If Preferences are known, DO NOT ask for them again.
      - If the user wants to change something, allow it by calling update_profile.
      - Ask ONE question at a time.
      - If you have all 3 (Name, Gothra, Preferences), call 'complete_onboarding'.
      - If the user says "done" or "what next", call 'complete_onboarding'.
    `;

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text || m.content }))
      ],
      tools: tools,
      tool_choice: "auto", 
    });

    const aiMessage = completion.choices[0].message;

    // 4. Handle Tools
    if (aiMessage.tool_calls) {
      const toolCall = aiMessage.tool_calls[0];
      
      if (toolCall.function.name === "update_profile") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Log what we are saving (for your terminal)
        console.log("Updating Profile:", args);

        const { error } = await supabase.from("profiles").update(args).eq("id", userId);
        
        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ text: "I had a slight trouble writing to the scrolls. Could you repeat that?" });
        }
        
        // SUCCESS: We return a manual response to avoid the OpenAI 400 error loop
        return NextResponse.json({ 
          text: `Thank you. I have noted that details. What else?` 
        });
      }

      if (toolCall.function.name === "complete_onboarding") {
         return NextResponse.json({ 
            text: "Thank you. I have everything I need to begin your search.",
            completed: true 
         });
      }
    }

    // 5. Normal Text Response (No tool called)
    return NextResponse.json({ text: aiMessage.content });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
