import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerProfile } = body;

    // --- MOCK INTELLIGENCE ENGINE ---
    // In the future, this is where you call OpenAI.
    // For now, we generate contextual hints based on available data.
    
    const name = partnerProfile?.full_name?.split(' ')[0] || "them";
    const city = partnerProfile?.location || "their city";
    const job = partnerProfile?.profession || "their work";
    const community = partnerProfile?.sub_community || "community";

    const hints = [
      `Sutradhar notices you both value ${community}. Ask about their family traditions.`,
      `Since ${name} is in ${city}, ask about the best food spots there.`,
      `"I saw your profile mentions ${job}. How do you find the work-life balance?"`,
      `Break the ice: "Sutradhar thinks our stars might align. Do you believe in horoscopes?"`,
      `Ask ${name}: "What is the one thing you are looking for that you haven't found yet?"`
    ];

    // Pick a random hint
    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    // Add a slight delay to make it feel like "thinking"
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ hint: randomHint });
    
  } catch (error) {
    return NextResponse.json({ hint: "Ask them about their hobbies and what they do for fun!" });
  }
}
