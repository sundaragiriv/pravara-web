import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the User's Message
    const { message, context } = await req.json();

    // 2. Fetch User's Profile (To know who is asking)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 3. System Prompt: The Persona
    const systemPrompt = `
      You are Sutradhar, a wise, traditional, yet modern matrimonial consultant for 'Pravara'.
      You are talking to ${profile?.full_name || 'a member'}.
      
      Your Role:
      - Answer questions about relationships, compatibility, and culture.
      - Be warm, encouraging, and dignified (like an elder family member).
      - If the user asks about a match, give balanced, thoughtful advice based on Indian values (Family, Education, Stability).
      - Keep answers concise (under 3 sentences) unless asked for details.
      
      Context of current page: ${context || "General Dashboard"}
    `;

    // 4. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Assistant Error:", error);
    return NextResponse.json({ error: "Sutradhar is meditating..." }, { status: 500 });
  }
}
