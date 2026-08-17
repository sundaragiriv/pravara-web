import { NextResponse } from "next/server";
import OpenAI from "openai";

import { sutradharRequestSchema } from "@/lib/api-schemas";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";
import { SUTRADHAR_FACTS, SUTRADHAR_RULES } from "@/lib/sutradhar-facts";
import {
  EDITABLE_FIELDS,
  FIELD_LABELS,
  checkFieldValue,
  isEditableField,
} from "@/lib/sutradhar-fields";
import { createClient } from "@/utils/supabase/server";

// Lazy so the client isn't constructed at build time (Next "collecting page
// data" would otherwise fail when OPENAI_API_KEY isn't in the build env).
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

/**
 * Bounds the reply. Without it, output length — and cost — is unbounded, and a
 * prompt-injection attempt that asks for ten thousand words simply gets them.
 */
const MAX_REPLY_TOKENS = 500;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      // Named for what it does. The old name was update_profile and it wrote
      // straight to the database, so the model's own sense of the tool matched
      // the danger rather than the intent.
      name: "propose_profile_update",
      description:
        "Propose a change to one field of the member's own profile. This does NOT save anything — it shows the member the change so they can confirm it. Only call this when the member has actually told you the new value.",
      parameters: {
        type: "object",
        properties: {
          field: {
            type: "string",
            enum: [...EDITABLE_FIELDS],
            description: "The profile field to change.",
          },
          value: {
            type: "string",
            description: "The new value, exactly as the member gave it.",
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
      description:
        "Search other member profiles by profession, gothra, location or age range.",
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

    const payload = sutradharRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { message, contextPath, history } = payload.data;
    const sanitizedMessage = sanitizePlainText(message);
    const sanitizedContextPath = sanitizePlainText(contextPath || "/");

    // Facts first, then rules, then where the member is standing. The rules
    // reference the facts ("answer only from the above"), so the order matters.
    const systemPrompt = [
      SUTRADHAR_FACTS,
      "",
      SUTRADHAR_RULES,
      "",
      `The member is currently on the page ${sanitizedContextPath}.`,
    ].join("\n");

    const priorTurns = history.map((turn) => ({
      role: turn.role,
      content: sanitizePlainText(turn.content),
    }));

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      // Low but not zero. This is a factual assistant reading from a fixed pack;
      // invention is the failure mode we are designing against, not dullness.
      temperature: 0.3,
      max_tokens: MAX_REPLY_TOKENS,
      messages: [
        { role: "system", content: systemPrompt },
        ...priorTurns,
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

    if (toolCall.function.name === "propose_profile_update") {
      let args: { field?: string; value?: string };
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        return NextResponse.json({ reply: "I could not read that change. Could you say it again?" });
      }

      const field = args.field ?? "";
      if (!isEditableField(field)) {
        return NextResponse.json({
          reply: `I cannot change "${field || "that"}" from here. You can edit it in your profile.`,
        });
      }

      const checked = checkFieldValue(field, args.value ?? "");
      if (!checked.ok) {
        // Refusals for the constrained fields carry their own explanation —
        // they are the interesting case and deserve to be read, not swallowed.
        return NextResponse.json({ reply: checked.reason });
      }

      // Nothing is written here. The proposal goes back for the member to
      // confirm, and only /api/sutradhar/confirm touches the database.
      return NextResponse.json({
        reply: `Shall I set your ${FIELD_LABELS[field]} to this?`,
        proposal: {
          field,
          value: checked.value,
          label: FIELD_LABELS[field],
        },
      });
    }

    if (toolCall.function.name === "search_matches") {
      let args: {
        profession?: string;
        gothra?: string;
        location?: string;
        min_age?: number;
        max_age?: number;
      };
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        return NextResponse.json({ reply: "I could not read those search terms." });
      }

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
        console.error("Sutradhar search error:", error.message);
        return NextResponse.json({
          reply: "I could not run that search just now. Please try again in a moment.",
        });
      }

      if (!matches?.length) {
        return NextResponse.json({
          reply: "I did not find any profiles matching those criteria.",
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
            `- ${match.full_name} (${match.age || "age not given"}, ${match.profession || "profession not given"}, ${match.location || "location not given"})`
        )
        .join("\n");

      return NextResponse.json({
        reply: `Here is what I found:\n\n${resultString}`,
      });
    }

    return NextResponse.json({ reply: "I am not sure how to do that yet." });
  } catch (error) {
    console.error("Sutradhar error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { reply: "I could not reach the assistant just now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
