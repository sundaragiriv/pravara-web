// VEDIC KNOWLEDGE BASE - PAN-INDIAN EDITION
// This is the "Truth Source" for cultural matching in the Pravara platform
// Covers both Pancha Dravida (South) and Pancha Gauda (North) Brahmin structures

export const VEDIC_DATA = {
  // 1. GOTHRA & PRAVARA (Universal - Applies to both North & South)
  // The Pravara structure is Vedic, so a Kanyakubja Kashyapa 
  // and an Iyer Kashyapa share the SAME Pravara.
  gothras: {
    "kashyapa": {
      pravara_options: [
        "Kashyapa - Avatsara - Naidhruva (3 Rishis)",
        "Kashyapa - Avatsara - Asita (3 Rishis)", 
        "Saptarishi (7 Rishis - Rare)"
      ],
      description: "Descendants of Rishi Kashyapa"
    },
    "bharadwaja": {
      pravara_options: [
        "Angirasa - Barhaspatya - Bharadwaja (3 Rishis)"
      ],
      description: "Descendants of Rishi Bharadwaja"
    },
    "srivatsa": {
      pravara_options: [
        "Bhargava - Chyavana - Apnavana - Aurva - Jamadagni (5 Rishis)"
      ],
      description: "Descendants of Rishi Jamadagni (Bhargava)"
    },
    "kaundinya": {
      pravara_options: [
        "Vasishta - Maitravaruna - Kaundinya (3 Rishis)"
      ],
      description: "Descendants of Rishi Vasishta"
    },
    "harithasa": {
      pravara_options: [
        "Angirasa - Ambarisha - Yauvanaswa (3 Rishis)"
      ],
      description: "Descendants of King Ambarisha"
    },
    "kausika": {
      pravara_options: [
        "Viswamitra - Aghamarshana - Kausika (3 Rishis)"
      ],
      description: "Viswamitra Lineage"
    },
    "gargya": {
      pravara_options: [
        "Angirasa - Barhaspatya - Bharadwaja - Sainya - Gargya (5 Rishis)",
        "Angirasa - Sainya - Gargya (3 Rishis)"
      ],
      description: "Descendants of Rishi Garga (Common in North)"
    },
    "sandilya": {
      pravara_options: [
        "Kashyapa - Avatsara - Sandilya (3 Rishis)",
        "Kashyapa - Daivala - Asita (3 Rishis)"
      ],
      description: "Descendants of Rishi Sandilya (Common in Saryuparin/Maithil)"
    },
    "upamanyu": {
      pravara_options: [
        "Vasistha - Indrapramada - Bharadvasu (3 Rishis)"
      ],
      description: "Descendants of Rishi Upamanyu (Common in North)"
    },
    "parashara": {
      pravara_options: [
        "Vasistha - Shaktya - Parashara (3 Rishis)"
      ],
      description: "Descendants of Rishi Parashara"
    },
    "gautama": {
      pravara_options: [
        "Angirasa - Ayasya - Gautama (3 Rishis)"
      ],
      description: "Descendants of Rishi Gautama"
    },
    "vashishta": {
      pravara_options: [
        "Vasishta - Indrapramada (3 Rishis)",
        "Vasishta - Aindra (3 Rishis)"
      ],
      description: "Direct lineage of Rishi Vashishta"
    },
    "atri": {
      pravara_options: ["Atreya - Archananasa - Syavasva (3 Rishis)"],
      description: "Descendants of Rishi Atri, father of Dattatreya"
    },
    "vishwamitra": {
      pravara_options: ["Vishvamitra - Devarata - Audrija (3 Rishis)"],
      description: "The sage who composed Gayatri Mantra"
    },
    "agastya": {
      pravara_options: ["Agastya - Tarcya - Aurava (3 Rishis)"],
      description: "The sage who brought Vedic culture to South India"
    }
  },

  // 2. SPIRITUAL INFLUENCE (Divided by Region)
  spiritual_orgs: [
    // --- SOUTH INDIAN MATHAS ---
    "Sringeri Sharada Peetham (Smartha)",
    "Kanchi Kamakoti Peetham (Smartha)",
    "Ahobila Mutt (Sri Vaishnava)",
    "Andavan Ashramam (Sri Vaishnava)",
    "Parakala Mutt (Sri Vaishnava)",
    "Uttaradi Matha (Madhva)",
    "Raghavendra Swamy Matha (Madhva)",
    
    // --- NORTH INDIAN SAMPRADAYAS ---
    "Ramanandi Sampradaya (Ayodhya/North)",
    "Pushtimarg / Vallabhacharya (Gujarat/UP)",
    "Nimbarka Sampradaya (Mathura/North)",
    "Gaudiya Vaishnavism (Bengal/Iskon)",
    "Nath Sampradaya (Gorakhnath)",
    "Shakta Tradition (Kali/Durga Worship - Bengal/Bihar)",
    
    // --- MODERN / PAN-INDIAN ---
    "Iskon (Hare Krishna)",
    "Isha Foundation (Sadhguru)",
    "Art of Living (Sri Sri)",
    "Chinmaya Mission",
    "Ramakrishna Mission",
    "BAPS Swaminarayan",
    
    // --- INDEPENDENT ---
    "No specific affiliation",
    "Family follows traditional practices independently"
  ],

  // 3. SUB-COMMUNITIES (The Big Divider)
  sub_communities: [
    // --- PANCHA DRAVIDA (South) ---
    "Niyogi (Telugu)", 
    "Vaidiki Velanadu (Telugu)", 
    "Vaidiki Veginadu (Telugu)", 
    "Dravida (Telugu/Tamil)",
    "Iyer - Vadama", 
    "Iyer - Brahacharanam", 
    "Iyer - Vathima",
    "Iyengar - Vadakalai", 
    "Iyengar - Thenkalai",
    "Smartha - Hoysala Karnataka", 
    "Madhva - Deshastha", 
    "Madhva - Shivalli", 
    "Havyaka (Karnataka)",
    "Nambudiri (Kerala)",
    
    // --- PANCHA GAUDA (North) ---
    "Kanyakubja (UP/Central)", 
    "Saryuparin (UP/East)", 
    "Gaur Brahmin (Haryana/Rajasthan)", 
    "Sanadhya (Western UP)",
    "Maithil (Bihar)", 
    "Saraswat - Goud (GSB)", 
    "Saraswat - Chitrapur", 
    "Kashmiri Pandit",
    "Khandelwal (Rajasthan)", 
    "Dadhich (Rajasthan)", 
    "Pareek (Rajasthan)",
    "Utkala (Odisha)", 
    "Rarhi (Bengal)", 
    "Barendra (Bengal)"
  ],

  // 4. RELIGIOUS LEVELS
  religious_levels: [
    "Orthodox (Strict Vaidika/Agamic)",
    "Traditional (Follows Rituals & Festivals)",
    "Spiritual but not Religious",
    "Cultural Hindu (Socially involved only)",
    "Modern / Liberal"
  ]
};

// Helper function to get Pravara options for a given Gothra
export function getPravaraOptionsForGothra(gothra: string): string[] | null {
  if (!gothra) return null;
  
  // Fuzzy match (case-insensitive)
  const match = Object.keys(VEDIC_DATA.gothras).find(g => 
    g.toLowerCase() === gothra.toLowerCase().trim()
  );
  
  return match ? VEDIC_DATA.gothras[match as keyof typeof VEDIC_DATA.gothras].pravara_options : null;
}

// Helper to validate Pravara against Gothra
export function isPravaraValidForGothra(gothra: string, pravara: string): boolean {
  const validOptions = getPravaraOptionsForGothra(gothra);
  if (!validOptions) return false;
  
  return validOptions.some(option => 
    option.toLowerCase().includes(pravara.toLowerCase()) ||
    pravara.toLowerCase().includes(option.toLowerCase())
  );
}

// Helper to detect North vs South based on sub-community
export function detectRegion(subCommunity: string): "north" | "south" | "unknown" {
  if (!subCommunity) return "unknown";
  
  const south = ["niyogi", "vaidiki", "iyer", "iyengar", "smartha", "madhva", "havyaka", "nambudiri", "dravida"];
  const north = ["kanyakubja", "saryuparin", "gaur", "maithil", "saraswat", "kashmiri", "khandelwal", "dadhich", "pareek", "utkala", "rarhi", "barendra"];
  
  const normalized = subCommunity.toLowerCase();
  
  if (south.some(s => normalized.includes(s))) return "south";
  if (north.some(n => normalized.includes(n))) return "north";
  
  return "unknown";
}
