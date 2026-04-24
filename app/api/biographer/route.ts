import { NextResponse } from "next/server";
import { OpenAI } from "openai";

import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText, sanitizeProfileValue } from "@/lib/sanitize";
import { VEDIC_DATA, getPravaraOptionsForGothra } from "@/lib/vedicData";
import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_PROFILE_COLUMNS = new Set([
  "full_name",
  "age",
  "gender",
  "marital_status",
  "dob",
  "birth_time",
  "birth_place",
  "nakshatra",
  "nakshatra_padam",
  "raasi",
  "sub_community",
  "gothra",
  "pravara",
  "education",
  "profession",
  "employer",
  "visa_status",
  "location",
  "height",
  "weight",
  "diet",
  "family_details",
  "smoking",
  "drinking",
  "religious_level",
  "spiritual_org",
  "audio_bio_url",
  "video_bio_url",
  "bio",
  "partner_preferences",
  "image_url",
  "gallery_images",
]);

const ONBOARDING_STEPS = [
  "full_name",
  "age",
  "gender",
  "marital_status",
  "dob",
  "birth_time",
  "birth_place",
  "nakshatra",
  "nakshatra_padam",
  "sub_community",
  "gothra",
  "pravara",
  "education",
  "profession",
  "employer",
  "visa_status",
  "location",
  "height",
  "weight",
  "diet",
  "family_details",
  "smoking",
  "drinking",
  "religious_level",
  "spiritual_org",
  "audio_bio_url",
  "video_bio_url",
  "bio",
  "partner_preferences",
] as const;

const humanize = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export async function POST(req: Request) {
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

    const rateLimit = await enforceRateLimit(req, RATE_LIMITS.biographer, `user:${user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const { messages, currentProfile } = await req.json();
    const lastUserMessage = sanitizePlainText(String(messages[messages.length - 1]?.content || ""));
    const lastAiQuestion = sanitizePlainText(String(messages[messages.length - 2]?.content || ""));

    const isAskingPartnerPrefs =
      lastAiQuestion.toLowerCase().includes("partner") ||
      lastAiQuestion.toLowerCase().includes("looking for") ||
      lastAiQuestion.toLowerCase().includes("qualities") ||
      lastAiQuestion.toLowerCase().includes("spouse") ||
      lastAiQuestion.toLowerCase().includes("ideal match");

    const extraction = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a strict data extractor for a matrimonial profile database.

CONTEXT: AI asked: "${lastAiQuestion}"
USER REPLIED: "${lastUserMessage}"

${
  isAskingPartnerPrefs
    ? `The AI was asking about partner preferences. The response describes the user's ideal partner, not the user. Put the entire response into "partner_preferences" as a single string. Output valid JSON only.`
    : `Extract the user's own details into these database columns:
${ONBOARDING_STEPS.join(", ")}

Rules:
1. Only use column names from the list above.
2. For height and weight, only extract numeric measurements.
3. For age, only extract a number.
4. If the user mentions Niyogi, Vaidiki, or similar, extract it as "sub_community".
5. For "spiritual_org", output an array.
6. Output valid JSON only. Use {} if nothing is extractable.`
}`,
        },
        { role: "user", content: `Context: ${lastAiQuestion}\nUser Input: ${lastUserMessage}` },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const extractedData = JSON.parse(extraction.choices[0]?.message?.content || "{}") as Record<
      string,
      unknown
    >;

    let updatedProfile: Record<string, unknown> = { ...currentProfile, religion: "Hindu" };

    if (Object.keys(extractedData).length > 0) {
      Object.entries(extractedData).forEach(([key, rawValue]) => {
        const value = sanitizeProfileValue(rawValue);

        if (isAskingPartnerPrefs && key !== "partner_preferences") return;
        if (!VALID_PROFILE_COLUMNS.has(key)) return;
        if (value === null || value === undefined || value === "" || value === "..." || value === "skip") return;

        if (key === "dob") {
          const dateValue = String(value).trim();
          if (/^\d{4}$/.test(dateValue)) {
            updatedProfile.age = new Date().getFullYear() - parseInt(dateValue, 10);
            return;
          }
          if (!dateValue.includes("-") && !dateValue.includes("/")) return;
        }

        if (key === "partner_preferences") {
          const existing = String(updatedProfile.partner_preferences || "");
          const nextValue = String(value);
          updatedProfile[key] = existing && !existing.includes(nextValue) ? `${existing}. ${nextValue}` : nextValue;
          return;
        }

        if (key === "age" || key === "nakshatra_padam") {
          const parsed = parseInt(String(value), 10);
          if (!Number.isNaN(parsed)) updatedProfile[key] = parsed;
          return;
        }

        if (key === "height" || key === "weight") {
          const descriptive = ["tall", "short", "average", "medium", "slim", "heavy"];
          if (descriptive.includes(String(value).toLowerCase())) return;
          updatedProfile[key] = String(value);
          return;
        }

        updatedProfile[key] = value;
      });

      if (updatedProfile.spiritual_org === "" || updatedProfile.spiritual_org === null) {
        updatedProfile.spiritual_org = [];
      } else if (typeof updatedProfile.spiritual_org === "string") {
        updatedProfile.spiritual_org = [updatedProfile.spiritual_org];
      }

      if (updatedProfile.dob && !String(updatedProfile.dob).includes("-")) {
        updatedProfile.dob = null;
      }
      if (updatedProfile.dob === "") updatedProfile.dob = null;
      if (updatedProfile.birth_time === "") updatedProfile.birth_time = null;

      const cleanedProfile: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updatedProfile)) {
        if (VALID_PROFILE_COLUMNS.has(key) || key === "id" || key === "religion") {
          cleanedProfile[key] = sanitizeProfileValue(value);
        }
      }

      if (currentProfile.id) {
        const { error } = await supabase.from("profiles").update(cleanedProfile).eq("id", currentProfile.id);
        if (error) console.error("DB Update Failed:", error.message);
      }

      updatedProfile = cleanedProfile;
    }

    const missingFields = ONBOARDING_STEPS.filter((field) => {
      const value = updatedProfile[field];
      if (Array.isArray(value)) return value.length === 0;
      if (field === "partner_preferences" && typeof value === "string" && value.length > 5) return false;
      return !value || value === "..." || value === "" || value === "skip";
    });

    const nextFieldToAsk = missingFields.find((field) => field === "partner_preferences") || missingFields[0];

    let specificInstruction = "";
    switch (nextFieldToAsk) {
      case "sub_community":
        specificInstruction =
          "Ask culturally: To understand your Vedic roots better, could you share your sub-community? Example: Niyogi, Vaidiki, Iyer.";
        break;
      case "gothra":
        specificInstruction =
          "Ask clearly for their Gothra. Mention examples like Kashyapa, Bharadwaja, Harithasa, and Kaundinya.";
        break;
      case "pravara": {
        try {
          const userGothra = String(updatedProfile.gothra || "").toLowerCase().trim();
          let pravaraHint = "";

          if (userGothra && VEDIC_DATA?.gothras) {
            const gothraData = VEDIC_DATA.gothras[userGothra as keyof typeof VEDIC_DATA.gothras];
            if (gothraData) {
              pravaraHint = `User is ${updatedProfile.gothra}. Ask whether their lineage follows ${gothraData.pravara_options.join(" or ")}.`;
            } else {
              const pravaraOptions = getPravaraOptionsForGothra(userGothra) || [];
              if (pravaraOptions.length > 0) {
                pravaraHint = `They said they are ${updatedProfile.gothra} Gothra. Ask if they belong to ${pravaraOptions.join(" or ")} Pravara.`;
              }
            }
          }

          specificInstruction =
            pravaraHint || "Ask for their Pravara and explain that it confirms their exact Vedic branch within their Gothra.";
        } catch (error) {
          console.warn("Vedic Lookup Error:", error);
          specificInstruction = "Ask for their Pravara.";
        }
        break;
      }
      case "spiritual_org":
        specificInstruction = `Ask about their spiritual influences. Mention options like ${
          VEDIC_DATA?.spiritual_orgs?.slice(0, 4).join(", ") || "Iskon, Sringeri"
        } and note they can mention multiple.`;
        break;
      case "religious_level":
        specificInstruction =
          "Ask gently how they would describe their family's religious lifestyle: Orthodox, Traditional, Spiritual or Philosophical, or Modern or Liberal.";
        break;
      case "marital_status":
        specificInstruction = "Ask about their marital status: Never Married, Divorced, or Widowed.";
        break;
      case "dob":
      case "birth_time":
      case "birth_place":
        specificInstruction =
          "Explain that an accurate horoscope match needs date, time, and place of birth. Ask for all three gently.";
        break;
      case "nakshatra_padam":
        specificInstruction =
          "Ask which Pada their Nakshatra belongs to, and reassure them it can be calculated later if needed.";
        break;
      case "visa_status":
        specificInstruction =
          "Ask about their visa or residency status, for example Citizen, Green Card, H1B, Student Visa, or Indian Citizen.";
        break;
      case "family_details":
        specificInstruction =
          "Ask for brief family details, including parents and siblings, to help families understand compatibility.";
        break;
      case "employer":
        specificInstruction = "Ask who they currently work for and note that it helps with career context.";
        break;
      case "smoking":
      case "drinking":
        specificInstruction = "Ask gently about lifestyle habits and mention it is okay to skip.";
        break;
      case "audio_bio_url":
        specificInstruction = "Ask whether they would like to add an audio bio later from the dashboard. It is optional.";
        break;
      case "video_bio_url":
        specificInstruction = "Mention that a video bio is optional and can be added later from the dashboard.";
        break;
      case "partner_preferences":
        specificInstruction =
          "This is the final question. Ask what qualities they are looking for in a partner and do not let them skip.";
        break;
      default:
        specificInstruction = nextFieldToAsk
          ? `Ask for ${humanize(nextFieldToAsk)} in a conversational way.`
          : "";
        break;
    }

    const rawName = updatedProfile.full_name;
    const isNameInvalid =
      !rawName ||
      ["traveler", "user", "guest", "...", "", "null"].includes(String(rawName).trim().toLowerCase());

    let systemInstruction = "";
    if (isNameInvalid) {
      systemInstruction = "User is brand new. Introduce yourself as Sutradhar and warmly ask for their full name.";
    } else if (!nextFieldToAsk) {
      systemInstruction =
        "Profile is complete. Give a warm closing statement, confirm their profile is ready, and guide them to click Complete and Save.";
    } else {
      systemInstruction = `Onboarding mode. User is ${updatedProfile.full_name}. Ask for ${humanize(
        nextFieldToAsk
      )}. ${specificInstruction} Acknowledge their latest input naturally before asking the next question.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Sutradhar, an intelligent and culturally conscious matrimonial assistant. ${systemInstruction}`,
        },
        ...messages,
      ],
      temperature: 0.8,
    });

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content,
      updatedProfile,
    });
  } catch (error) {
    console.error("CRITICAL AI ERROR:", error);
    return new NextResponse(JSON.stringify({ error: "AI Processing Failed" }), { status: 500 });
  }
}
