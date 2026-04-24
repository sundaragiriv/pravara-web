import { NextRequest, NextResponse } from "next/server";

import { RATE_LIMITS, enforceRateLimit } from "@/lib/ratelimit";
import { sanitizePlainText } from "@/lib/sanitize";
import { createClient } from "@/utils/supabase/server";

function toInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(request, RATE_LIMITS.matches, `user:${user.id}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("gender, partner_min_age, partner_max_age, partner_diet, partner_marital_status, partner_location_pref")
      .eq("id", user.id)
      .single();

    const myGender = myProfile?.gender ?? null;
    const oppositeGender = myGender === "Male" ? "Female" : myGender === "Female" ? "Male" : null;

    const { searchParams } = new URL(request.url);
    const hasExplicitAge = searchParams.has("minAge") || searchParams.has("maxAge");
    const hasExplicitDiet = searchParams.has("diet");
    const hasExplicitLocation = searchParams.has("location");

    const minAge = hasExplicitAge ? toInt(searchParams.get("minAge"), 18) : (myProfile?.partner_min_age ?? 18);
    const maxAge = hasExplicitAge ? toInt(searchParams.get("maxAge"), 60) : (myProfile?.partner_max_age ?? 60);

    const minHeight = searchParams.get("minHeight");
    const maxHeight = searchParams.get("maxHeight");
    const location = hasExplicitLocation
      ? sanitizePlainText(String(searchParams.get("location") || ""))
      : sanitizePlainText(String(myProfile?.partner_location_pref || ""));
    const diet = hasExplicitDiet
      ? sanitizePlainText(String(searchParams.get("diet") || ""))
      : myProfile?.partner_diet && myProfile.partner_diet !== "No Preference"
        ? sanitizePlainText(myProfile.partner_diet)
        : null;
    const marital =
      sanitizePlainText(String(searchParams.get("marital") || "")) ||
      (myProfile?.partner_marital_status && myProfile.partner_marital_status !== "No Preference"
        ? sanitizePlainText(myProfile.partner_marital_status)
        : null);
    const visa = sanitizePlainText(String(searchParams.get("visa") || ""));
    const gothra = sanitizePlainText(String(searchParams.get("gothra") || ""));
    const searchTerm = sanitizePlainText(String(searchParams.get("search") || ""));
    const excludeUserId = sanitizePlainText(String(searchParams.get("excludeUser") || user.id));
    const limit = Math.min(100, Math.max(1, toInt(searchParams.get("limit"), 50)));

    let query = supabase.from("profiles").select("*").neq("id", excludeUserId);

    if (oppositeGender) {
      query = query.eq("gender", oppositeGender);
    }

    if (minAge > 18) {
      query = query.gte("age", minAge);
    }
    if (maxAge < 60) {
      query = query.lte("age", maxAge);
    }

    if (marital) {
      query = query.eq("marital_status", marital);
    }

    if (minHeight) {
      query = query.gte("height", sanitizePlainText(minHeight));
    }
    if (maxHeight) {
      query = query.lte("height", sanitizePlainText(maxHeight));
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (visa) {
      query = query.ilike("visa_status", `%${visa}%`);
    }

    if (diet) {
      const dietValues = diet.split(",").map((value) => value.trim()).filter(Boolean);
      if (dietValues.length === 1) {
        query = query.ilike("diet", `%${dietValues[0]}%`);
      } else if (dietValues.length > 1) {
        query = query.or(dietValues.map((value) => `diet.ilike.%${value}%`).join(","));
      }
    }

    if (gothra) {
      query = query.or(
        `gothra.ilike.%${gothra}%,sub_community.ilike.%${gothra}%,nakshatra.ilike.%${gothra}%,raasi.ilike.%${gothra}%`
      );
    }

    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%`
      );
    }

    const { data: profiles, error } = await query.limit(limit);

    if (error) {
      console.error("Matches API Error:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
