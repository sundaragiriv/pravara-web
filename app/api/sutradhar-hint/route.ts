import { NextResponse } from "next/server";

import { sutradharHintRequestSchema } from "@/lib/api-schemas";
import { sanitizePlainText } from "@/lib/sanitize";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = sutradharHintRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { partnerProfile } = payload.data;

    const name = sanitizePlainText(String(partnerProfile.full_name || "")).split(" ")[0] || "them";
    const city = sanitizePlainText(String(partnerProfile.location || "")) || "their city";
    const job = sanitizePlainText(String(partnerProfile.profession || "")) || "their work";
    const community = sanitizePlainText(String(partnerProfile.sub_community || "")) || "community";

    const hints = [
      `Sutradhar notices you both value ${community}. Ask about their family traditions.`,
      `Since ${name} is in ${city}, ask about the best food spots there.`,
      `"I saw your profile mentions ${job}. How do you find the work-life balance?"`,
      `Break the ice: "Sutradhar thinks our stars might align. Do you believe in horoscopes?"`,
      `Ask ${name}: "What is the one thing you are looking for that you have not found yet?"`,
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    return NextResponse.json({ hint: randomHint });

  } catch {
    return NextResponse.json({ hint: "Ask them about their hobbies and what they do for fun!" });
  }
}
