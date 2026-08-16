/**
 * The FAQ content, extracted from the page so that it has exactly one home.
 *
 * The FAQ page renders it, and `lib/sutradhar-facts.ts` compiles it into the
 * grounding pack the assistant answers from. That is the point of moving it:
 * Sutradhar and the public page cannot drift apart, because there is only one
 * copy of the text. Edit an answer here and both change together.
 *
 * Client-safe — plain data, no env reads, no server imports.
 */

export type FaqItem = { q: string; a: string };
export type FaqSection = { section: string; items: FaqItem[] };

export const FAQ_SECTIONS: FaqSection[] = [
  {
    section: "The Platform",
    items: [
      {
        q: "What is Pravara?",
        a: "Pravara is a heritage-first matrimonial platform built for the Brahmin community and families who honour Vedic traditions. Unlike general apps, Pravara integrates Gothra filtering, Kundali compatibility, and an AI guide called Sutradhar — making it the first platform that understands both your modernity and your roots.",
      },
      {
        q: "Who is Pravara built for?",
        a: "Primarily for Brahmin families across India and the diaspora who want a serious, values-aligned platform — one that respects Gothra, Pravara lineage, and Vedic compatibility — without sacrificing the intelligence of modern technology.",
      },
      {
        q: "Is Pravara free?",
        a: "Pravara has a free tier that lets you create a profile, interact with Sutradhar, and explore matches. Gold and Concierge plans unlock unlimited contacts, full Bhrugu reports, and human matchmaker access. See /pricing for details.",
      },
    ],
  },
  {
    section: "The AI System",
    items: [
      {
        q: "Who is Sutradhar (सूत्रधार)?",
        a: "In classical Sanskrit theatre, the Sutradhar — literally 'thread-holder' — was the director and narrator who set the context, guided the story, and gave voice to the characters. In Pravara, your AI Sutradhar plays the same role: it learns your story through conversation (not forms), understands your heritage and values, and guides your matchmaking journey. It can update your profile, surface matches, and suggest conversation starters — available at any hour.",
      },
      {
        q: "Who is Narada (नारद)?",
        a: "Narada Muni is the divine sage of Hindu tradition — the cosmic messenger who traversed all three worlds carrying important news between gods, sages, and humans. Known for being present wherever something significant was happening. In Pravara, Narada is your notification system: it alerts you when someone meaningful expresses interest, when a high-compatibility match joins, or when a connection responds to your message.",
      },
      {
        q: "What is the Bhrugu Match (भृगु मिलान)?",
        a: "Named after Maharishi Bhrugu — one of the Saptarishis and the father of Vedic astrology, credited with the Bhrugu Sutras. The Bhrugu Match is the 36-point Ashtakoota (Guna Milan) compatibility system. It evaluates eight compatibility factors: Varna, Vashya, Tara, Yoni, Gana, Bhakoot, Maitri, and Nadi — each carrying specific point weights. A score of 18+ indicates compatibility; 28+ indicates exceptional harmony. Nadi and Bhakoot doshas are flagged as critical. Pravara calculates this from your Nakshatra and Raasi data.",
      },
      {
        q: "Who is Varaahi (वाराही)?",
        a: "Varaahi is one of the seven Matrikas — the divine mothers in the Shakta tradition — and is the fierce protector among them. She wields power to guard against deception and harm. In Pravara, the Varaahi Shield is our trust and verification layer: community vouches from people who know you personally, guardian mode where trusted family members participate, and profile integrity signals. A high Varaahi score means a deeply trusted profile.",
      },
    ],
  },
  {
    section: "Vedic Concepts",
    items: [
      {
        q: "What is Gothra (गोत्र)?",
        a: "Gothra is a patrilineal clan lineage system in Vedic tradition, identifying descent from a common sage (Rishi). The tradition of sapinda exogamy prohibits marriage within the same Gothra, as it treats such unions as equivalent to sibling marriage. Pravara automatically detects and prevents same-Gothra connections from being initiated — this is a core, non-negotiable feature of the platform.",
      },
      {
        q: "What is Pravara (प्रवर)?",
        a: "Pravara is the lineage of rishis recited during Vedic fire ceremonies (Homas) to identify one's spiritual ancestry. Families sharing the same Pravara are considered to share a common lineage. Traditional practice discourages marriage between families with identical Pravara, even if Gothras differ. The platform takes Pravara lineage into account in compatibility calculations.",
      },
      {
        q: "What is Nakshatra (नक्षत्र)?",
        a: "The 27 (or 28) lunar mansions in Vedic astrology, determined by the position of the Moon at the moment of your birth. Each Nakshatra has specific attributes, ruling deities, and planetary lords. Your Nakshatra is the foundation of Bhrugu Match calculations — particularly for Tara (birth star compatibility) and Nadi (energy channel dosha) assessment.",
      },
      {
        q: "What is Raasi (राशि)?",
        a: "Raasi is your Moon sign — the zodiac sign the Moon occupied at the time of your birth. In Vedic astrology, Raasi is considered far more significant than the Western sun sign. It forms the basis for Bhakoot (sign compatibility) and Maitri (planetary friendship) calculations in the Bhrugu Match system.",
      },
      {
        q: "What is sub-community?",
        a: "Within the broader Brahmin tradition, families identify with regional and sectarian sub-communities — such as Iyer, Iyengar, Smartha, Madhwa, Niyogi, Kanyakubja, Saraswat, and many others. Pravara respects these distinctions and allows you to filter or open your search based on your family's preferences.",
      },
    ],
  },
];
