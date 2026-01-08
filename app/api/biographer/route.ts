import { createClient } from "@/utils/supabase/server";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { VEDIC_DATA, getPravaraOptionsForGothra } from "@/lib/vedicData";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. UPDATED MASTER LIST with WhatsApp Group Fields
const ONBOARDING_STEPS = [
  "full_name", 
  "age", "gender", "marital_status", // Added Marital Status early
  "dob", "birth_time", "birth_place", // The Horoscope Block
  "nakshatra", "nakshatra_padam",     // Specific Vedic details
  "sub_community", "gothra", "pravara",
  "education", "profession", "employer", // Added Employer
  "visa_status", // Critical for NRIs
  "location", "height", "weight", "diet",
  "family_details", // Parents & Siblings info
  "smoking", "drinking", 
  "religious_level", "spiritual_org",
  // MEDIA GROUP (Optional but asked)
  "audio_bio_url", "video_bio_url",
  "bio", 
  "partner_preferences" // MUST Remain Last
];

const humanize = (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { messages, currentProfile } = await req.json();

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lastAiQuestion = messages[messages.length - 2]?.content || ""; 

    // --- STEP 1: CONTEXT-AWARE EXTRACTION ---
    const extraction = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                // FIX #2: Added instruction for precise extraction
                content: `You are a Data Extractor for a matrimonial profile.
                
                CONTEXT: AI asked: "${lastAiQuestion}"
                USER REPLIED: "${lastUserMessage}"
                
                Target Fields: ${ONBOARDING_STEPS.join(', ')}.
                
                RULES:
                1. Extract facts ONLY. Do not infer "pursuing" unless stated. If user says "I am a Masters", extract "Masters".
                2. If user mentions "Niyogi", "Vaidiki", "Iyer", "Iyengar", etc., extract as 'sub_community'.
                3. If extracting 'spiritual_org', output an ARRAY of strings. Example: ["Iskon", "Sringeri"]. Users can mention multiple influences.
                4. Do NOT extract 'partner_preferences' from a general 'bio' statement.
                5. Output JSON only.`
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
            
            // Skip empty/invalid values
            if (!value || value === "..." || value === "" || value === "skip") return;

            // --- 1. DOB SAFEGUARD (The Fix for "1993" Error) ---
            if (k === 'dob') {
                const strVal = String(value).trim();
                
                // Scenario A: User gave just a Year (e.g., "1993")
                if (/^\d{4}$/.test(strVal)) {
                    // Calculate Age instead of crashing DOB
                    const birthYear = parseInt(strVal);
                    const currentYear = new Date().getFullYear();
                    updatedProfile.age = currentYear - birthYear;
                    return; // STOP here. Do not save "1993" to dob column.
                }
                
                // Scenario B: User gave a Date (e.g., "1993-05-20")
                // Ensure it's a valid ISO string or leave it to trigger a proper prompt later
                if (!strVal.includes('-') && !strVal.includes('/')) {
                     return; // Skip invalid formats to prevent DB crashes
                }
            }

            // --- 2. PARTNER PREFERENCES (Append Mode) ---
            if (k === 'partner_preferences') {
                const existing = updatedProfile.partner_preferences || "";
                if (!existing.includes(value)) {
                     updatedProfile[k] = existing ? `${existing}. ${value}` : value;
                }
                return; // Done with this field
            } 

            // --- 3. STANDARD MAPPING ---
            if (k === 'age') {
                updatedProfile[k] = parseInt(String(value), 10);
            } else {
                updatedProfile[k] = value;
            }
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

        // 4. Ghost Busting: Remove 'sub_sect' if it still lingers
        // @ts-ignore
        delete updatedProfile.sub_sect; 

        // -----------------------------------------------------------

        // NOW it is safe to save
        if (currentProfile.id) {
            const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', currentProfile.id);
            if (error) console.error("DB Update Failed:", error.message);
        }
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