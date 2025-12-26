import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the schema for structured data extraction
const extractionSchema = {
  type: "object",
  properties: {
    fullName: { type: "string" },
    age: { type: "integer" },
    gender: { type: "string" },
    location: { type: "string" },
    profession: { type: "string" },
    education: { type: "string" },
    bio: { type: "string" },
    gothra: { type: "string" },
    community: { type: "string" },
    partnerPreferences: { type: "string" },
    isComplete: { type: "boolean" } // AI decides if it has enough info to save
  },
  required: ["fullName", "age", "location", "gender"]
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { message, history, existingProfile } = await req.json();

    // 1. DYNAMIC SYSTEM PROMPT - Genesis vs Evolution Mode
    let systemPrompt = "";

    if (existingProfile) {
      // MODE: EVOLUTION (Editing existing profile)
      systemPrompt = `
        You are Sutradhar, the matrimonial concierge.
        You are speaking to **${existingProfile.full_name}**.
        
        CURRENT PROFILE DATA:
        ${JSON.stringify(existingProfile, null, 2)}

        YOUR GOAL:
        The user wants to UPDATE their profile. Do not ask for name/age again unless they want to change it.
        Listen to their request (e.g., "Change my location" or "Update partner preferences").
        
        - If they want to update 'Partner Preferences', ask clarifying questions about what they are looking for now.
        - If they just say "hi", ask: "Welcome back. Would you like to update your bio, location, or partner preferences?"
        
        OUTPUT JSON:
        Update the specific fields they mentioned. Keep other fields as they are.
        Set "isComplete": true ONLY when the user indicates they are done with edits.
      `;
    } else {
      // MODE: GENESIS (Creating new profile)
      systemPrompt = `
        You are Sutradhar, a dignified Indian matrimonial assistant.
        Your goal is to interview the user to build their profile.
        Ask questions ONE BY ONE in this order:
        1. Full name and age
        2. Gender
        3. Current location
        4. Profession and education
        5. Gothra (if applicable) and sub-community
        6. A brief bio about themselves
        7. Partner preferences
        
        Be warm, professional, and respectful. Use Indian cultural context.
        Set "isComplete": true when you have gathered all essential information.
      `;
    }

    // 2. Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((msg: any) => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      functions: [
        {
          name: "update_profile",
          description: "Extracts or updates user profile data",
          parameters: extractionSchema
        }
      ],
      function_call: "auto",
    });

    const aiMessage = completion.choices[0].message;

    // 3. Handle Function Call (Data Extraction)
    if (aiMessage.function_call) {
      const extractedData = JSON.parse(aiMessage.function_call.arguments);
      
      // If AI thinks we are done (isComplete = true)
      if (extractedData.isComplete) {
        return NextResponse.json({ 
          reply: existingProfile 
            ? "I have updated your profile details accordingly. Redirecting you to your dashboard..."
            : "Thank you. I have gathered everything I need. Creating your profile now...",
          profileComplete: true,
          extractedData 
        });
      }
    }

    // 4. Normal Reply (still gathering info)
    return NextResponse.json({ 
      reply: aiMessage.content || "Please continue...",
      profileComplete: false 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Sutradhar is meditating. Please try again.",
      reply: "I apologize, I momentarily lost connection. Please try again."
    }, { status: 500 });
  }
}
