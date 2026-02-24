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

    // Fetch current user's gender to filter for opposite gender
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single();

    const myGender = myProfile?.gender ?? null;
    const oppositeGender =
      myGender === 'Male' ? 'Female' :
      myGender === 'Female' ? 'Male' : null;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const minAge = parseInt(searchParams.get('minAge') || '18');
    const maxAge = parseInt(searchParams.get('maxAge') || '60');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const location = searchParams.get('location');
    const diet = searchParams.get('diet'); // comma-separated
    const visa = searchParams.get('visa');
    const gothra = searchParams.get('gothra'); // searches gothra, sub_community, nakshatra, raasi
    const searchTerm = searchParams.get('search');
    const excludeUserId = searchParams.get('excludeUser') || user.id;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', excludeUserId);

    // Only show opposite-gender profiles (core matrimony logic)
    if (oppositeGender) {
      query = query.eq('gender', oppositeGender);
    }

    // Age filter
    if (minAge) {
      query = query.gte('age', minAge);
    }
    if (maxAge) {
      query = query.lte('age', maxAge);
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
      const dietValues = diet.split(',').filter(d => d.trim());
      if (dietValues.length === 1) {
        query = query.ilike('diet', `%${dietValues[0]}%`);
      } else if (dietValues.length > 1) {
        // OR condition for multiple diet values
        const dietConditions = dietValues.map(d => `diet.ilike.%${d}%`).join(',');
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
