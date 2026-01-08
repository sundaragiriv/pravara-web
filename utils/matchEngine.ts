// utils/matchEngine.ts
// Vedic Match Engine - Calculates compatibility based on Indian matchmaking rules

interface Profile {
    age: number;
    gothra?: string;
    sub_community?: string;
    diet?: string;
    nakshatra?: string;
    rashi?: string;
    height?: number; // Height in cm
    location?: string;
    visa_status?: string;
    education?: string;
}

/**
 * Calculate compatibility score between two profiles
 * @param me - Current user's profile
 * @param them - Candidate profile
 * @returns Compatibility score (0-99)
 */
export function calculateMatchScore(me: Profile, them: Profile): number {
    let score = 0;
    const maxScore = 100;

    // --- RULE 1: GOTHRA (The "Sagothra" Check) - CRITICAL ---
    // In many communities, same Gothra is a sibling relationship (0% match).
    // This is a DEALBREAKER in traditional matchmaking.
    if (me.gothra && them.gothra && 
        me.gothra.toLowerCase().trim() === them.gothra.toLowerCase().trim()) {
        return 0; // IMMEDIATE DISQUALIFICATION: Same Gothra
    }

    // --- RULE 2: COMMUNITY (25 Points) ---
    // Same sub-community is highly preferred (Iyer-Iyer, Niyogi-Niyogi, etc.)
    if (me.sub_community && them.sub_community) {
        const myCommunity = me.sub_community.toLowerCase().trim();
        const theirCommunity = them.sub_community.toLowerCase().trim();
        
        if (myCommunity === theirCommunity) {
            score += 25; // Perfect match
        } else if (myCommunity.includes(theirCommunity) || theirCommunity.includes(myCommunity)) {
            score += 15; // Partial match
        }
    }

    // --- RULE 3: DIET (20 Points) ---
    // Diet compatibility is often non-negotiable
    if (me.diet && them.diet) {
        const myDiet = me.diet.toLowerCase();
        const theirDiet = them.diet.toLowerCase();
        
        if (myDiet === theirDiet) {
            score += 20; // Perfect match
        } else if (myDiet.includes('veg') && theirDiet.includes('veg')) {
            score += 15; // Both vegetarian variants
        } else if (myDiet.includes('non') && theirDiet.includes('non')) {
            score += 15; // Both non-vegetarian
        } else if (myDiet.includes('veg') && theirDiet.includes('non')) {
            score -= 5; // Mismatch penalty
        }
    }

    // --- RULE 4: AGE GAP (15 Points) ---
    // Proximity in age is generally preferred
    const ageDiff = Math.abs(me.age - them.age);
    if (ageDiff <= 3) {
        score += 15; // Very close in age
    } else if (ageDiff <= 5) {
        score += 12; // Acceptable gap
    } else if (ageDiff <= 8) {
        score += 8; // Moderate gap
    } else if (ageDiff <= 12) {
        score += 3; // Large gap but acceptable
    }

    // --- RULE 5: NAKSHATRA COMPATIBILITY (20 Points) ---
    // Vedic astrology considers Nakshatra (birth star) compatibility
    // Real vedic logic involves complex Guna Milan (out of 36 points)
    // For now, we award points for having chart data
    if (me.nakshatra && them.nakshatra) {
        score += 20;
        // Future enhancement: Implement actual Guna Milan logic
        // - Varna (Caste) - 1 point
        // - Vashya (Dominance) - 2 points
        // - Tara (Star) - 3 points
        // - Yoni (Animal) - 4 points
        // - Graha Maitri (Planetary friendship) - 5 points
        // - Gana (Temperament) - 6 points
        // - Bhakut (Moon sign) - 7 points
        // - Nadi (Health/genetics) - 8 points
    } else if (me.nakshatra || them.nakshatra) {
        score += 10; // Partial data available
    }

    // --- RULE 6: LOCATION (10 Points) ---
    // Geographic proximity or same city preference
    if (me.location && them.location) {
        const myLoc = me.location.toLowerCase().trim();
        const theirLoc = them.location.toLowerCase().trim();
        
        if (myLoc === theirLoc) {
            score += 10; // Same city
        } else if (myLoc.includes(theirLoc) || theirLoc.includes(myLoc)) {
            score += 5; // Nearby area
        }
    }

    // --- RULE 7: HEIGHT COMPATIBILITY (10 Points) ---
    // Traditional preference consideration
    if (me.height && them.height) {
        const heightDiff = Math.abs(me.height - them.height);
        if (heightDiff <= 10) {
            score += 10; // Very similar height
        } else if (heightDiff <= 20) {
            score += 7; // Acceptable difference
        } else {
            score += 3; // Large difference
        }
    }

    // --- BONUS FACTORS ---
    
    // Education Level (5 Points)
    if (me.education && them.education && 
        me.education.toLowerCase() === them.education.toLowerCase()) {
        score += 5;
    }

    // Visa Status (For NRI matches) (5 Points)
    if (me.visa_status && them.visa_status) {
        const myVisa = me.visa_status.toLowerCase();
        const theirVisa = them.visa_status.toLowerCase();
        
        if (myVisa === theirVisa) {
            score += 5;
        } else if ((myVisa.includes('citizen') || myVisa.includes('green')) && 
                   (theirVisa.includes('citizen') || theirVisa.includes('green'))) {
            score += 3; // Both permanent residents
        }
    }

    // Cap at 99% (Nobody is perfect - only divine matches are 100%)
    return Math.min(Math.max(score, 0), 99);
}

/**
 * Get color class based on match score
 * @param score - Compatibility score
 * @returns Tailwind color class
 */
export function getMatchColor(score: number): string {
    if (score === 0) return "text-red-500"; // Sagothra warning
    if (score >= 85) return "text-green-500"; // Excellent match
    if (score >= 70) return "text-haldi-500"; // Good match
    if (score >= 50) return "text-yellow-500"; // Average match
    return "text-stone-400"; // Low compatibility
}

/**
 * Get match quality label
 * @param score - Compatibility score
 * @returns Human-readable match quality
 */
export function getMatchLabel(score: number): string {
    if (score === 0) return "Incompatible (Sagothra)";
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Very Good";
    if (score >= 50) return "Good Match";
    if (score >= 30) return "Average";
    return "Low Compatibility";
}

/**
 * Get heart icon fill status based on score
 * @param score - Compatibility score
 * @returns Whether heart should be filled
 */
export function shouldFillHeart(score: number): boolean {
    return score >= 70;
}
