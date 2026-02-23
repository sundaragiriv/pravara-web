import { createClient } from "@/utils/supabase/server";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { VEDIC_DATA, getPravaraOptionsForGothra } from "@/lib/vedicData";
import { ratelimit, getClientIP } from "@/lib/ratelimit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. VALID DATABASE COLUMNS (only these can be updated)
const VALID_PROFILE_COLUMNS = new Set([
  "full_name", "age", "gender", "marital_status",
  "dob", "birth_time", "birth_place",
  "nakshatra", "nakshatra_padam", "raasi",
  "sub_community", "gothra", "pravara",
  "education", "profession", "employer",
  "visa_status", "location", "height", "weight", "diet",
  "family_details", "smoking", "drinking",
  "religious_level", "spiritual_org",
  "audio_bio_url", "video_bio_url",
  "bio", "partner_preferences", "image_url", "gallery_images"
]);

// 2. ONBOARDING FLOW ORDER
const ONBOARDING_STEPS = [
  "full_name",
  "age", "gender", "marital_status",
  "dob", "birth_time", "birth_place",
  "nakshatra", "nakshatra_padam",
  "sub_community", "gothra", "pravara",
  "education", "profession", "employer",
  "visa_status",
  "location", "height", "weight", "diet",
  "family_details",
  "smoking", "drinking",
  "religious_level", "spiritual_org",
  "audio_bio_url", "video_bio_url",
  "bio",
  "partner_preferences"
];

const humanize = (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export async function POST(req: Request) {
  try {
    // ── Rate limit check ─────────────────────────────────────────────────────
    const ip = getClientIP(req);
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
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
    const { messages, currentProfile } = await req.json();

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lastAiQuestion = messages[messages.length - 2]?.content || ""; 

    // --- STEP 1: CONTEXT-AWARE EXTRACTION ---
    // CRITICAL: Detect if AI was asking about PARTNER preferences
    const isAskingPartnerPrefs = lastAiQuestion.toLowerCase().includes('partner') ||
                                  lastAiQuestion.toLowerCase().includes('looking for') ||
                                  lastAiQuestion.toLowerCase().includes('qualities') ||
                                  lastAiQuestion.toLowerCase().includes('spouse') ||
                                  lastAiQuestion.toLowerCase().includes('ideal match');

    const extraction = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a strict Data Extractor for a matrimonial profile database.

CONTEXT: AI asked: "${lastAiQuestion}"
USER REPLIED: "${lastUserMessage}"

${isAskingPartnerPrefs ? `
⚠️ CRITICAL: The AI was asking about PARTNER PREFERENCES (what the user wants in a spouse).
The user's response describes their IDEAL PARTNER, NOT themselves.
Put the ENTIRE response into "partner_preferences" as a single string.
DO NOT extract to height, diet, education, etc. - those are for the USER's own profile.

Output: {"partner_preferences": "${lastUserMessage}"}
` : `
Extract the user's OWN details into these database columns:
${ONBOARDING_STEPS.join(', ')}

RULES:
1. ONLY use column names from the list above.
2. For height/weight: Only extract numbers (e.g., "175 cm", "70 kg"). Skip "tall", "slim", etc.
3. For age: Only extract numbers.
4. If user mentions "Niyogi", "Vaidiki", etc., extract as 'sub_community'.
5. For 'spiritual_org', output an ARRAY: ["Iskon", "Sringeri"].
6. Output valid JSON only. Empty object {} if nothing to extract.
`}`
            },
            { role: "user", content: `Context: ${lastAiQuestion}\nUser Input: ${lastUserMessage}` }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
    });

    const extractedData = JSON.parse(extraction.choices[0].message.content || "{}");

    let updatedProfile = { ...currentProfile };
    // Auto-fill hidden fields
    updatedProfile.religion = "Hindu"; 

    if (Object.keys(extractedData).length > 0) {
        Object.keys(extractedData).forEach(k => {
            let value = extractedData[k];

            // --- 0A. PARTNER PREFERENCES CONTEXT GUARD ---
            // If AI was asking about partner preferences, ONLY allow partner_preferences field
            if (isAskingPartnerPrefs && k !== 'partner_preferences') {
                console.log(`Context guard: Blocking ${k} - AI was asking about partner preferences`);
                return;
            }

            // --- 0B. SKIP INVALID COLUMNS (Prevents "music_oriented" type errors) ---
            if (!VALID_PROFILE_COLUMNS.has(k)) {
                console.log(`Skipping unknown column: ${k}`);
                return;
            }

            // Skip empty/invalid values
            if (value === null || value === undefined || value === "..." || value === "" || value === "skip") return;

            // --- 1. DOB SAFEGUARD (The Fix for "1993" Error) ---
            if (k === 'dob') {
                const strVal = String(value).trim();

                // Scenario A: User gave just a Year (e.g., "1993")
                if (/^\d{4}$/.test(strVal)) {
                    const birthYear = parseInt(strVal);
                    const currentYear = new Date().getFullYear();
                    updatedProfile.age = currentYear - birthYear;
                    return;
                }

                // Scenario B: Invalid date format
                if (!strVal.includes('-') && !strVal.includes('/')) {
                    return;
                }
            }

            // --- 2. PARTNER PREFERENCES (Append Mode) ---
            if (k === 'partner_preferences') {
                const existing = updatedProfile.partner_preferences || "";
                if (!existing.includes(value)) {
                    updatedProfile[k] = existing ? `${existing}. ${value}` : value;
                }
                return;
            }

            // --- 3. INTEGER FIELDS (age, nakshatra_padam) ---
            if (k === 'age' || k === 'nakshatra_padam') {
                const parsed = parseInt(String(value), 10);
                if (!isNaN(parsed)) {
                    updatedProfile[k] = parsed;
                }
                return;
            }

            // --- 4. HEIGHT/WEIGHT (Keep as string, but validate) ---
            if (k === 'height' || k === 'weight') {
                // Convert descriptive words to null (will prompt again)
                const descriptive = ['tall', 'short', 'average', 'medium', 'slim', 'heavy'];
                if (descriptive.includes(String(value).toLowerCase())) {
                    // Don't save descriptive words, let user provide actual measurement
                    return;
                }
                updatedProfile[k] = String(value);
                return;
            }

            // --- 5. STANDARD MAPPING ---
            updatedProfile[k] = value;
        });

        // --- 🛡️ FINAL SANITIZATION BEFORE SAVE 🛡️ ---
        // This block fixes "Malformed Array", "Invalid Date", and "Sub Sect" errors automatically.

        // 1. Fix Arrays (spiritual_org): Convert "" to []
        if (updatedProfile.spiritual_org === "" || updatedProfile.spiritual_org === null) {
            updatedProfile.spiritual_org = [];
        } else if (typeof updatedProfile.spiritual_org === 'string') {
            // If it accidentally became a string, wrap it in an array
            updatedProfile.spiritual_org = [updatedProfile.spiritual_org];
        }

        // 2. Fix Dates (dob): Kill "1993" or invalid formats
        if (updatedProfile.dob) {
            // If it's just a year (e.g. "1993") or doesn't have a hyphen, set to NULL to prevent crash
            if (!String(updatedProfile.dob).includes('-')) {
                updatedProfile.dob = null; 
            }
        }
        // Handle empty string for DOB
        if (updatedProfile.dob === "") updatedProfile.dob = null;

        // 3. Fix Time (birth_time): Empty string -> NULL
        if (updatedProfile.birth_time === "") updatedProfile.birth_time = null;

        // 4. Ghost Busting: Remove any invalid columns that slipped through
        const cleanedProfile: Record<string, any> = {};
        for (const [key, value] of Object.entries(updatedProfile)) {
            if (VALID_PROFILE_COLUMNS.has(key) || key === 'id' || key === 'religion') {
                cleanedProfile[key] = value;
            }
        }

        // -----------------------------------------------------------

        // NOW it is safe to save
        if (currentProfile.id) {
            const { error } = await supabase.from('profiles').update(cleanedProfile).eq('id', currentProfile.id);
            if (error) console.error("DB Update Failed:", error.message);
        }

        // Update reference for response
        updatedProfile = cleanedProfile;
    }

    // --- STEP 2: DIRECTOR ---
    const missingFields = ONBOARDING_STEPS.filter(field => {
        const val = updatedProfile[field];
        // 1. Arrays (Spiritual Org) - Check if empty
        if (Array.isArray(val)) return val.length === 0;
        
        // 2. Partner Preferences - Check if it's already detailed (more than 5 chars)
        if (field === 'partner_preferences' && val && val.length > 5) return false;
        
        // 3. Standard Text - Check for empty/skip
        return !val || val === "..." || val === "" || val === "skip";
    });

    // FIX #3 & #5: Prioritize critical fields over optional media
    let nextFieldToAsk = missingFields.find(f => f === 'partner_preferences') || missingFields[0];

    let specificInstruction = "";

    // FIX #1: VARY RESPONSES & FIX #5: ASK FOR MEDIA
    switch (nextFieldToAsk) {
        case 'sub_community':
            specificInstruction = "Ask culturally: 'To understand your Vedic roots better, could you share your sub-community? (e.g., Niyogi, Vaidiki, Iyer)'.";
            break;
        case 'gothra':
            specificInstruction = "This is essential. Ask clearly for their Gothra. Mention common ones like Kashyapa, Bharadwaja, Harithasa, Kaundinya to guide them.";
            break;
        case 'pravara':
            // --- SAFEGUARDED VEDIC LOGIC ---
            try {
                const userGothra = updatedProfile.gothra?.toLowerCase().trim();
                let pravaraHint = "";
                
                // Safe check: Ensure VEDIC_DATA exists and userGothra is valid
                if (userGothra && VEDIC_DATA && VEDIC_DATA.gothras) {
                    // Try exact match first
                    let gothraData = VEDIC_DATA.gothras[userGothra as keyof typeof VEDIC_DATA.gothras];

                    if (!gothraData) {
                        // Try fuzzy match using helper function
                        const pravaraOptions = getPravaraOptionsForGothra(userGothra);
                        if (pravaraOptions && pravaraOptions.length > 0) {
                            const optionsText = pravaraOptions.length === 1 
                                ? pravaraOptions[0]
                                : pravaraOptions.slice(0, -1).join(", ") + " or " + pravaraOptions[pravaraOptions.length - 1];
                            pravaraHint = `They said they are ${updatedProfile.gothra} Gothra. Ask: "Do you belong to the ${optionsText} Pravara?" Give them options to choose from. Be conversational.`;
                        }
                    } else {
                        const options = gothraData.pravara_options.join(" OR ");
                        pravaraHint = `User is ${updatedProfile.gothra}. Ask: "Does your lineage follow the ${options}?"`;
                    }
                }
                
                specificInstruction = pravaraHint || "Ask for their Pravara (Rishi Lineage). Explain that this confirms their exact Vedic branch within their Gothra.";
            } catch (err) {
                console.warn("Vedic Lookup Error:", err); // Log error but don't crash
                specificInstruction = "Ask for their Pravara (Lineage).";
            }
            break;
        case 'spiritual_org':
            try {
                // Safe slice in case array is missing
                const orgs = VEDIC_DATA?.spiritual_orgs?.slice(0, 4).join(", ") || "Iskon, Sringeri";
                specificInstruction = `Ask about their spiritual influences. IMPORTANT: They can choose MULTIPLE. Be conversational: "Is your family influenced by ${orgs}, or perhaps modern movements? You can mention multiple if applicable." Explain that this helps find families with similar spiritual alignment.`;
            } catch (err) {
                console.warn("Spiritual Org Error:", err);
                specificInstruction = "Ask about spiritual or guru influences.";
            }
            break;
        case 'religious_level':
            specificInstruction = "Ask gently: 'How would you describe your family's religious lifestyle? Are you strictly Orthodox (daily rituals, Sandhyavandana), Traditional (festivals + temple visits), Spiritual/Philosophical, or more Modern/Liberal?' Be warm and non-judgmental.";
            break;
        case 'marital_status':
            specificInstruction = "Ask about their marital status: Never Married, Divorced, or Widowed. This is important for matching preferences.";
            break;
        case 'dob':
        case 'birth_time':
        case 'birth_place':
            specificInstruction = "Explain that to generate an accurate Horoscope match, we need their Date, Time, and Place of Birth. Ask for all three gently. Format: DD/MM/YYYY for date, HH:MM AM/PM for time.";
            break;
        case 'nakshatra_padam':
            specificInstruction = "Ask which 'Pada' (Quarter) their Nakshatra belongs to (1, 2, 3, or 4). If they don't know, reassure them we can calculate it from the birth time later.";
            break;
        case 'visa_status':
            specificInstruction = "Since this is a global platform, ask about their Visa/Residency status (e.g., Citizen, Green Card, H1B, Student Visa, or Others). For India-based users, they can say 'Indian Citizen'.";
            break;
        case 'family_details':
            specificInstruction = "Ask for a brief family background: Father's and Mother's names and occupations, and details about siblings (how many, married/unmarried). This helps families understand compatibility.";
            break;
        case 'employer':
            specificInstruction = "Ask who they currently work for (Employer Name or Company). Assure them this helps understand their career stability and is kept private.";
            break;
        case 'smoking':
        case 'drinking':
            specificInstruction = "Ask gently about lifestyle habits like smoking or drinking. Mention it's okay to skip.";
            break;
        case 'audio_bio_url':
            specificInstruction = "Ask if they would like to add an Audio Bio later from their dashboard to make their profile stand out. This is optional.";
            break;
        case 'video_bio_url':
             specificInstruction = "Mention that a Video Bio is a great way to show personality. Ask if they plan to add one later. Optional.";
             break;
        case 'partner_preferences':
            specificInstruction = "CRITICAL: This is the final and most important question. Ask: 'Before we finish, what are the most important qualities you are looking for in a partner?' Do not let them skip.";
            break;
        default:
            specificInstruction = `Ask for ${humanize(nextFieldToAsk)} in a conversational way. Vary your phrasing. Do not always start with 'Thank you'.`;
            break;
    }

    let systemInstruction = "";
    const rawName = updatedProfile?.full_name;
    const isNameInvalid = !rawName || ["traveler", "user", "guest", "...", "", "null"].includes(String(rawName).trim().toLowerCase());

    if (isNameInvalid) {
        systemInstruction = "User is BRAND NEW. Introduce yourself as Sutradhar. Warmly ask for their Full Name to begin.";
    } else if (!nextFieldToAsk) {
        systemInstruction = "Profile COMPLETE. Give a warm closing statement, summarize that their profile is ready, and guide them to click the 'Complete & Save' button.";
    } else {
        // FIX #1: Better conversational instruction
        systemInstruction = `
            ONBOARDING MODE.
            Knowing user: ${updatedProfile.full_name}.
            GOAL: Ask for ${humanize(nextFieldToAsk)}.
            GUIDANCE: ${specificInstruction}
            
            CONTEXT: User just said "${lastUserMessage}".
            Acknowledge their input naturally (e.g., "Got it," "That's interesting," "Understood") before asking the next question. Avoid repetitive "Thank you" phrasing.
        `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are Sutradhar, an intelligent and culturally conscious matrimonial assistant. ${systemInstruction}` },
        ...messages
      ],
      temperature: 0.8, // Increased slightly for more variety
    });

    return NextResponse.json({ 
        reply: completion.choices[0].message.content,
        updatedProfile: updatedProfile 
    });

  } catch (error: any) {
    console.error("❌ CRITICAL AI ERROR:", error);
    return new NextResponse(JSON.stringify({ error: "AI Processing Failed" }), { status: 500 });
  }
}