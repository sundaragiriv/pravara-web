import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ratelimit, getClientIP } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    // ── Rate limit check ─────────────────────────────────────────────────────
    const ip = getClientIP(request);
    const { success, limit: rlLimit, reset: rlReset, remaining: rlRemaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rlLimit),
            "X-RateLimit-Remaining": String(rlRemaining),
            "X-RateLimit-Reset": String(rlReset),
            "Retry-After": String(Math.ceil((rlReset - Date.now()) / 1000)),
          },
        }
      );
    }

    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch current user's profile — gender + partner preferences
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender, partner_min_age, partner_max_age, partner_diet, partner_marital_status, partner_location_pref')
      .eq('id', user.id)
      .single();

    const myGender = myProfile?.gender ?? null;
    const oppositeGender =
      myGender === 'Male' ? 'Female' :
      myGender === 'Female' ? 'Male' : null;

    // Parse query parameters (explicit user-set filters take priority over stored preferences)
    const { searchParams } = new URL(request.url);
    const hasExplicitAge  = searchParams.has('minAge') || searchParams.has('maxAge');
    const hasExplicitDiet = searchParams.has('diet');
    const hasExplicitLoc  = searchParams.has('location');

    // Age: explicit filter → use it; otherwise fall back to stored preferences
    const minAge = hasExplicitAge
      ? parseInt(searchParams.get('minAge') || '18')
      : (myProfile?.partner_min_age ?? 18);
    const maxAge = hasExplicitAge
      ? parseInt(searchParams.get('maxAge') || '60')
      : (myProfile?.partner_max_age ?? 60);

    const minHeight  = searchParams.get('minHeight');
    const maxHeight  = searchParams.get('maxHeight');
    const location   = hasExplicitLoc  ? searchParams.get('location')   : (myProfile?.partner_location_pref   || null);
    const diet       = hasExplicitDiet ? searchParams.get('diet')        : (myProfile?.partner_diet && myProfile.partner_diet !== 'No Preference' ? myProfile.partner_diet : null);
    const marital    = searchParams.get('marital') || (myProfile?.partner_marital_status && myProfile.partner_marital_status !== 'No Preference' ? myProfile.partner_marital_status : null);
    const visa       = searchParams.get('visa');
    const gothra     = searchParams.get('gothra');
    const searchTerm = searchParams.get('search');
    const excludeUserId = searchParams.get('excludeUser') || user.id;
    const limit      = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', excludeUserId);

    // Only show opposite-gender profiles (core matrimony logic)
    if (oppositeGender) {
      query = query.eq('gender', oppositeGender);
    }

    // Age filter (explicit or from stored preferences)
    if (minAge && minAge > 18) {
      query = query.gte('age', minAge);
    }
    if (maxAge && maxAge < 60) {
      query = query.lte('age', maxAge);
    }

    // Marital status filter
    if (marital) {
      query = query.eq('marital_status', marital);
    }

    // Height filter (stored as string like "175" or "5'8")
    if (minHeight) {
      query = query.gte('height', minHeight);
    }
    if (maxHeight) {
      query = query.lte('height', maxHeight);
    }

    // Location filter (ILIKE for partial match)
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Visa filter
    if (visa) {
      query = query.ilike('visa_status', `%${visa}%`);
    }

    // Diet filter (can be multiple values)
    if (diet) {
      const dietValues = diet.split(',').filter((d: string) => d.trim());
      if (dietValues.length === 1) {
        query = query.ilike('diet', `%${dietValues[0]}%`);
      } else if (dietValues.length > 1) {
        // OR condition for multiple diet values
        const dietConditions = dietValues.map((d: string) => `diet.ilike.%${d}%`).join(',');
        query = query.or(dietConditions);
      }
    }

    // Gothra/Community search (searches multiple fields)
    if (gothra) {
      query = query.or(`gothra.ilike.%${gothra}%,sub_community.ilike.%${gothra}%,nakshatra.ilike.%${gothra}%,raasi.ilike.%${gothra}%`);
    }

    // Full-text search (name, location, profession)
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%`);
    }

    // Execute with limit
    const { data: profiles, error } = await query.limit(limit);

    if (error) {
      console.error('Matches API Error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });

  } catch (error) {
    console.error('Matches API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
