// utils/matchEngine.ts
// Pravara — Real Ashtakoot Guna Milan Engine
// All 8 Kuta scores computed from Nakshatra/Raasi lookup tables.
// No external DB calls — all reference data is embedded as lookup maps.

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AshtakootProfile {
  id?: string;
  gender?: 'Male' | 'Female' | 'Other' | null;
  gothra?: string | null;
  gothra_id?: number | null;
  nakshatra?: string | null;
  nakshatra_id?: number | null;
  raasi?: string | null;
  raasi_id?: number | null;
  sub_community?: string | null;
  community_id?: number | null;
  diet?: string | null;
  age?: number | null;
  location?: string | null;
  education?: string | null;
  visa_status?: string | null;
  marital_status?: string | null;
}

export interface KutaBreakdown {
  varna:       { score: number; max: 2  };
  vashya:      { score: number; max: 2  };
  tara:        { score: number; max: 3  };
  yoni:        { score: number; max: 4  };
  graha:       { score: number; max: 5  };
  gana:        { score: number; max: 6  };
  bhakoot:     { score: number; max: 7  };
  nadi:        { score: number; max: 8  };
}

export interface GunaResult {
  total:            number;   // /36
  breakdown:        KutaBreakdown;
  sagothra:         boolean;
  nadiDosha:        boolean;
  bhakootDosha:     boolean;
  ganaDosha:        boolean;
  label:            string;   // Uttama | Madhyama | Alpa | Sagothra
  summaryLine:      string;
  /** 0–99 scaled score for legacy UI that expects a percentage-style number */
  legacyScore:      number;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Nakshatra Master Table (all 8 Kuta attributes)
// ─────────────────────────────────────────────────────────────────────────────

interface NakshatraRow {
  id:    number;
  name:  string;
  alt:   string[];
  raasi: string;
  gana:  'Deva' | 'Manushya' | 'Rakshasa';
  nadi:  'Vata' | 'Pitta' | 'Kapha';
  yoni:  string;
  varna: string;
  lord:  string;
}

const NAKSHATRAS: NakshatraRow[] = [
  { id:  1, name: 'Ashwini',          alt: ['aswini','ashvini'],                          raasi: 'Mesha',     gana: 'Deva',     nadi: 'Vata',  yoni: 'Horse',    varna: 'Vaishya',   lord: 'Ketu'    },
  { id:  2, name: 'Bharani',          alt: ['bharini','bhorani'],                         raasi: 'Mesha',     gana: 'Manushya', nadi: 'Pitta', yoni: 'Elephant', varna: 'Mleccha',   lord: 'Venus'   },
  { id:  3, name: 'Krittika',         alt: ['karthika','kartika','krithika'],              raasi: 'Mesha',     gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Sheep',    varna: 'Brahmin',   lord: 'Sun'     },
  { id:  4, name: 'Rohini',           alt: ['rohani'],                                    raasi: 'Vrishabha', gana: 'Manushya', nadi: 'Kapha', yoni: 'Serpent',  varna: 'Shudra',    lord: 'Moon'    },
  { id:  5, name: 'Mrigashira',       alt: ['mrigasira','mrugasira'],                     raasi: 'Vrishabha', gana: 'Deva',     nadi: 'Pitta', yoni: 'Serpent',  varna: 'Farmer',    lord: 'Mars'    },
  { id:  6, name: 'Ardra',            alt: ['arudra','thiruvathira'],                     raasi: 'Mithuna',   gana: 'Manushya', nadi: 'Vata',  yoni: 'Dog',      varna: 'Butcher',   lord: 'Rahu'    },
  { id:  7, name: 'Punarvasu',        alt: ['punarpoosam','punarpusam'],                  raasi: 'Mithuna',   gana: 'Deva',     nadi: 'Vata',  yoni: 'Cat',      varna: 'Vaishya',   lord: 'Jupiter' },
  { id:  8, name: 'Pushya',           alt: ['poosam','pushyam','pooyam'],                 raasi: 'Karka',     gana: 'Deva',     nadi: 'Pitta', yoni: 'Sheep',    varna: 'Kshatriya', lord: 'Saturn'  },
  { id:  9, name: 'Ashlesha',         alt: ['ayilyam','aslesha'],                         raasi: 'Karka',     gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Cat',      varna: 'Mleccha',   lord: 'Mercury' },
  { id: 10, name: 'Magha',            alt: ['makha','magam'],                             raasi: 'Simha',     gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Rat',      varna: 'Shudra',    lord: 'Ketu'    },
  { id: 11, name: 'Purva Phalguni',   alt: ['pubba','pooram','puram'],                    raasi: 'Simha',     gana: 'Manushya', nadi: 'Pitta', yoni: 'Rat',      varna: 'Brahmin',   lord: 'Venus'   },
  { id: 12, name: 'Uttara Phalguni',  alt: ['uttara','uthiram'],                          raasi: 'Kanya',     gana: 'Manushya', nadi: 'Pitta', yoni: 'Cow',      varna: 'Kshatriya', lord: 'Sun'     },
  { id: 13, name: 'Hasta',            alt: ['hastam','atham'],                            raasi: 'Kanya',     gana: 'Deva',     nadi: 'Pitta', yoni: 'Buffalo',  varna: 'Vaishya',   lord: 'Moon'    },
  { id: 14, name: 'Chitra',           alt: ['chithra','chithirai'],                       raasi: 'Tula',      gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Tiger',    varna: 'Farmer',    lord: 'Mars'    },
  { id: 15, name: 'Swati',            alt: ['swathi','chothi'],                           raasi: 'Tula',      gana: 'Deva',     nadi: 'Kapha', yoni: 'Buffalo',  varna: 'Butcher',   lord: 'Rahu'    },
  { id: 16, name: 'Vishakha',         alt: ['visakha','vishakam'],                        raasi: 'Vrischika', gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Tiger',    varna: 'Mleccha',   lord: 'Jupiter' },
  { id: 17, name: 'Anuradha',         alt: ['anusham','anizham'],                         raasi: 'Vrischika', gana: 'Deva',     nadi: 'Pitta', yoni: 'Hare',     varna: 'Shudra',    lord: 'Saturn'  },
  { id: 18, name: 'Jyeshtha',         alt: ['kettai','triketta'],                         raasi: 'Vrischika', gana: 'Rakshasa', nadi: 'Vata',  yoni: 'Hare',     varna: 'Farmer',    lord: 'Mercury' },
  { id: 19, name: 'Mula',             alt: ['moola','moolam'],                            raasi: 'Dhanu',     gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Dog',      varna: 'Butcher',   lord: 'Ketu'    },
  { id: 20, name: 'Purva Ashadha',    alt: ['pooradam','purvashada'],                     raasi: 'Dhanu',     gana: 'Manushya', nadi: 'Pitta', yoni: 'Monkey',   varna: 'Brahmin',   lord: 'Venus'   },
  { id: 21, name: 'Uttara Ashadha',   alt: ['uttaradam','uttarashada'],                   raasi: 'Makara',    gana: 'Manushya', nadi: 'Pitta', yoni: 'Mongoose', varna: 'Kshatriya', lord: 'Sun'     },
  { id: 22, name: 'Shravana',         alt: ['sravanam','thiruvonam','sravana'],            raasi: 'Makara',    gana: 'Deva',     nadi: 'Kapha', yoni: 'Monkey',   varna: 'Mleccha',   lord: 'Moon'    },
  { id: 23, name: 'Dhanishtha',       alt: ['dhanista','avittam','shravishtha'],           raasi: 'Kumbha',    gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Lion',     varna: 'Farmer',    lord: 'Mars'    },
  { id: 24, name: 'Shatabhisha',      alt: ['sadayam','shatataraka'],                     raasi: 'Kumbha',    gana: 'Rakshasa', nadi: 'Vata',  yoni: 'Horse',    varna: 'Butcher',   lord: 'Rahu'    },
  { id: 25, name: 'Purva Bhadrapada', alt: ['poorattathi','purvabhadra'],                 raasi: 'Meena',     gana: 'Manushya', nadi: 'Vata',  yoni: 'Lion',     varna: 'Brahmin',   lord: 'Jupiter' },
  { id: 26, name: 'Uttara Bhadrapada',alt: ['uttarattathi','uttarabhadra'],               raasi: 'Meena',     gana: 'Manushya', nadi: 'Pitta', yoni: 'Cow',      varna: 'Kshatriya', lord: 'Saturn'  },
  { id: 27, name: 'Revati',           alt: ['revathi'],                                   raasi: 'Meena',     gana: 'Deva',     nadi: 'Kapha', yoni: 'Elephant', varna: 'Shudra',    lord: 'Mercury' },
];

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Raasi attributes
// ─────────────────────────────────────────────────────────────────────────────

interface RaasiRow {
  id:     number;
  name:   string;
  alt:    string[];
  lord:   string;
  vashya: string;
}

const RAASIS: RaasiRow[] = [
  { id:  1, name: 'Mesha',     alt: ['aries','mesh'],        lord: 'Mars',    vashya: 'Chatushpada' },
  { id:  2, name: 'Vrishabha', alt: ['taurus','vrisabha'],   lord: 'Venus',   vashya: 'Chatushpada' },
  { id:  3, name: 'Mithuna',   alt: ['gemini','mithun'],     lord: 'Mercury', vashya: 'Manava'      },
  { id:  4, name: 'Karka',     alt: ['cancer','karkata'],    lord: 'Moon',    vashya: 'Jalchara'    },
  { id:  5, name: 'Simha',     alt: ['leo','singh'],         lord: 'Sun',     vashya: 'Vanachara'   },
  { id:  6, name: 'Kanya',     alt: ['virgo','kanni'],       lord: 'Mercury', vashya: 'Manava'      },
  { id:  7, name: 'Tula',      alt: ['libra','thula'],       lord: 'Venus',   vashya: 'Manava'      },
  { id:  8, name: 'Vrischika', alt: ['scorpio','vrishchik'], lord: 'Mars',    vashya: 'Kita'        },
  { id:  9, name: 'Dhanu',     alt: ['sagittarius','dhan'],  lord: 'Jupiter', vashya: 'Chatushpada' },
  { id: 10, name: 'Makara',    alt: ['capricorn','makar'],   lord: 'Saturn',  vashya: 'Jalchara'    },
  { id: 11, name: 'Kumbha',    alt: ['aquarius','kumbh'],    lord: 'Saturn',  vashya: 'Manava'      },
  { id: 12, name: 'Meena',     alt: ['pisces','meen'],       lord: 'Jupiter', vashya: 'Jalchara'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Yoni Compatibility (key = "A|B" alphabetically sorted)
// ─────────────────────────────────────────────────────────────────────────────

// Sworn enemies (0 pts) — alphabetically ordered pair
const YONI_ENEMIES = new Set([
  'Buffalo|Horse', 'Cat|Rat', 'Cow|Tiger',
  'Dog|Hare', 'Elephant|Lion', 'Mongoose|Serpent', 'Monkey|Sheep',
]);

// Friendly pairs (3 pts)
const YONI_FRIENDS = new Set([
  'Elephant|Horse', 'Elephant|Sheep', 'Horse|Sheep',
  'Cat|Serpent', 'Cow|Rat',
]);

function yoniKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

function yoniScore(a: string, b: string): number {
  if (!a || !b) return 2; // no data → neutral
  if (a === b) return 4;
  const key = yoniKey(a, b);
  if (YONI_ENEMIES.has(key)) return 0;
  if (YONI_FRIENDS.has(key)) return 3;
  return 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Planetary Friendship (for Graha Maitri)
// ─────────────────────────────────────────────────────────────────────────────

type Relation = 'Friend' | 'Neutral' | 'Enemy';

const PLANET_FRIENDSHIP: Record<string, Record<string, Relation>> = {
  Sun:     { Sun:'Friend', Moon:'Friend', Mars:'Friend', Mercury:'Neutral', Jupiter:'Friend', Venus:'Enemy',  Saturn:'Enemy'   },
  Moon:    { Sun:'Friend', Moon:'Friend', Mars:'Neutral',Mercury:'Friend',  Jupiter:'Friend', Venus:'Neutral',Saturn:'Neutral' },
  Mars:    { Sun:'Friend', Moon:'Neutral',Mars:'Friend', Mercury:'Enemy',   Jupiter:'Friend', Venus:'Neutral',Saturn:'Neutral' },
  Mercury: { Sun:'Neutral',Moon:'Neutral',Mars:'Neutral',Mercury:'Friend',  Jupiter:'Neutral',Venus:'Friend', Saturn:'Neutral' },
  Jupiter: { Sun:'Friend', Moon:'Friend', Mars:'Friend', Mercury:'Enemy',   Jupiter:'Friend', Venus:'Enemy',  Saturn:'Neutral' },
  Venus:   { Sun:'Neutral',Moon:'Neutral',Mars:'Neutral',Mercury:'Friend',  Jupiter:'Neutral',Venus:'Friend', Saturn:'Friend'  },
  Saturn:  { Sun:'Neutral',Moon:'Neutral',Mars:'Neutral',Mercury:'Friend',  Jupiter:'Neutral',Venus:'Friend', Saturn:'Friend'  },
};

function grahaScore(lordA: string, lordB: string): number {
  if (!lordA || !lordB) return 3; // no data → average
  const ab = PLANET_FRIENDSHIP[lordA]?.[lordB] ?? 'Neutral';
  const ba = PLANET_FRIENDSHIP[lordB]?.[lordA] ?? 'Neutral';
  const toNum = (r: Relation) => r === 'Friend' ? 2 : r === 'Neutral' ? 1 : 0;
  const total = toNum(ab) + toNum(ba);
  if (total === 4) return 5; // both friend
  if (total === 3) return 4; // friend + neutral
  if (total === 2) return 3; // both neutral or friend+enemy
  if (total === 1) return 2; // neutral + enemy
  if (total === 0) return 0; // both enemy
  return 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Varna Ranks
// ─────────────────────────────────────────────────────────────────────────────

const VARNA_RANK: Record<string, number> = {
  Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1,
  Farmer: 1, Butcher: 1, Mleccha: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Vashya Affinity Matrix
// ─────────────────────────────────────────────────────────────────────────────

const VASHYA_SCORE: Record<string, Record<string, number>> = {
  Manava:      { Manava:2, Vanachara:1, Chatushpada:0, Jalchara:1, Kita:0 },
  Vanachara:   { Manava:1, Vanachara:2, Chatushpada:1, Jalchara:0, Kita:0 },
  Chatushpada: { Manava:0, Vanachara:1, Chatushpada:2, Jalchara:0, Kita:0 },
  Jalchara:    { Manava:1, Vanachara:0, Chatushpada:0, Jalchara:2, Kita:1 },
  Kita:        { Manava:0, Vanachara:0, Chatushpada:0, Jalchara:1, Kita:2 },
};

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA — Gana Compatibility
// ─────────────────────────────────────────────────────────────────────────────

// groom (row) × bride (col)
const GANA_SCORE: Record<string, Record<string, number>> = {
  Deva:     { Deva:6, Manushya:6, Rakshasa:0 },
  Manushya: { Deva:0, Manushya:6, Rakshasa:0 },
  Rakshasa: { Deva:0, Manushya:0, Rakshasa:6 },
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/[-_\s]+/g, '');
}

function findNakshatra(nameOrId: string | number | null | undefined): NakshatraRow | null {
  if (nameOrId == null) return null;
  if (typeof nameOrId === 'number') return NAKSHATRAS.find(n => n.id === nameOrId) ?? null;
  const n = normalise(nameOrId);
  return NAKSHATRAS.find(row =>
    normalise(row.name) === n || row.alt.some(a => normalise(a) === n)
  ) ?? null;
}

function findRaasi(nameOrId: string | number | null | undefined): RaasiRow | null {
  if (nameOrId == null) return null;
  if (typeof nameOrId === 'number') return RAASIS.find(r => r.id === nameOrId) ?? null;
  const n = normalise(nameOrId);
  return RAASIS.find(row =>
    normalise(row.name) === n || row.alt.some(a => normalise(a) === n)
  ) ?? null;
}

function resolveRaasi(p: AshtakootProfile): RaasiRow | null {
  // Try raasi_id first, then raasi text, then derive from nakshatra
  let r = findRaasi(p.raasi_id ?? p.raasi);
  if (!r) {
    const nk = findNakshatra(p.nakshatra_id ?? p.nakshatra);
    if (nk) r = findRaasi(nk.raasi);
  }
  return r;
}

// ─────────────────────────────────────────────────────────────────────────────
// KUTA CALCULATORS
// ─────────────────────────────────────────────────────────────────────────────

/** Kuta 1 — Varna (max 2 for this platform; traditional max is 1 but we give 2 for same-varna) */
function calcVarna(groom: NakshatraRow | null, bride: NakshatraRow | null): number {
  if (!groom || !bride) return 1; // partial data → neutral
  const gr = VARNA_RANK[groom.varna] ?? 0;
  const br = VARNA_RANK[bride.varna] ?? 0;
  if (gr === br) return 2;
  if (gr >= br) return 1;
  return 0;
}

/** Kuta 2 — Vashya (max 2) */
function calcVashya(groomRaasi: RaasiRow | null, brideRaasi: RaasiRow | null): number {
  if (!groomRaasi || !brideRaasi) return 1;
  return VASHYA_SCORE[groomRaasi.vashya]?.[brideRaasi.vashya] ?? 0;
}

/** Kuta 3 — Tara/Dina (max 3) */
function calcTara(groomNk: NakshatraRow | null, brideNk: NakshatraRow | null): number {
  if (!groomNk || !brideNk) return 1;

  function taraPts(fromId: number, toId: number): number {
    const dist = ((toId - fromId + 27) % 27) + 1;
    const rem = dist % 9;
    // Good tara: 2 (Sampat), 4 (Kshema), 6 (Sadhaka), 8 (Mitra), 0 (Ati-Mitra)
    const good = new Set([0, 2, 4, 6, 8]);
    return good.has(rem) ? 1 : 0;
  }

  const g2b = taraPts(groomNk.id, brideNk.id);
  const b2g = taraPts(brideNk.id, groomNk.id);
  const total = g2b + b2g; // 0–2
  return total === 2 ? 3 : total === 1 ? 1 : 0; // scale to /3
}

/** Kuta 4 — Yoni (max 4) */
function calcYoni(groomNk: NakshatraRow | null, brideNk: NakshatraRow | null): number {
  return yoniScore(groomNk?.yoni ?? '', brideNk?.yoni ?? '');
}

/** Kuta 5 — Graha Maitri (max 5) */
function calcGraha(groomRaasi: RaasiRow | null, brideRaasi: RaasiRow | null): number {
  return grahaScore(groomRaasi?.lord ?? '', brideRaasi?.lord ?? '');
}

/** Kuta 6 — Gana (max 6) */
function calcGana(groomNk: NakshatraRow | null, brideNk: NakshatraRow | null): number {
  if (!groomNk || !brideNk) return 3;
  return GANA_SCORE[groomNk.gana]?.[brideNk.gana] ?? 0;
}

/** Kuta 7 — Bhakoot (max 7) */
function calcBhakoot(groomRaasi: RaasiRow | null, brideRaasi: RaasiRow | null): { score: number; dosha: boolean } {
  if (!groomRaasi || !brideRaasi) return { score: 4, dosha: false };

  const g = groomRaasi.id;
  const b = brideRaasi.id;

  function dist(from: number, to: number) {
    return ((to - from + 12) % 12) || 12;
  }

  const g2b = dist(g, b);
  const b2g = dist(b, g);
  // Dosha patterns: 2-12, 5-9, 6-8 (bidirectional)
  const doshaPair = (a: number, b: number) => new Set([a + '|' + b, b + '|' + a]).has('2|12') ||
    new Set([a + '|' + b, b + '|' + a]).has('5|9') ||
    new Set([a + '|' + b, b + '|' + a]).has('6|8');

  const isDoshaPattern = [g2b, b2g].sort().join('|') === '1|12' ||
    [g2b, b2g].sort().join('|') === '1|5' ||   // normalised 2-12
    (g2b === 1 && b2g === 1) ||                 // same raasi = 7 pts
    false;

  // Simpler direct check
  const pair = [g2b, b2g].sort((a,b)=>a-b).join('-');
  const DOSHA_PAIRS = new Set(['2-12','5-9','6-8']);
  const isDosha = DOSHA_PAIRS.has(pair);

  if (g === b) return { score: 7, dosha: false };          // same raasi
  if (isDosha) return { score: 0, dosha: true };
  return { score: 7, dosha: false };
}

/** Kuta 8 — Nadi (max 8) */
function calcNadi(groomNk: NakshatraRow | null, brideNk: NakshatraRow | null): { score: number; dosha: boolean } {
  if (!groomNk || !brideNk) return { score: 4, dosha: false };
  if (groomNk.nadi === brideNk.nadi) return { score: 0, dosha: true };
  return { score: 8, dosha: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// GOTHRA CHECK
// ─────────────────────────────────────────────────────────────────────────────

function isSagothra(a: AshtakootProfile, b: AshtakootProfile): boolean {
  if (a.gothra_id && b.gothra_id) return a.gothra_id === b.gothra_id;
  if (a.gothra && b.gothra) {
    return normalise(a.gothra) === normalise(b.gothra);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART SUMMARY LINE
// ─────────────────────────────────────────────────────────────────────────────

function buildSummaryLine(
  total: number,
  breakdown: KutaBreakdown,
  nadiDosha: boolean,
  bhakootDosha: boolean,
  ganaDosha: boolean,
  sagothra: boolean,
): string {
  if (sagothra) return 'Same Gothra — not permitted by Vedic tradition.';
  if (nadiDosha) return 'Nadi Dosha present — same energy channel. Consult family before proceeding.';

  if (total >= 30) return 'Exceptional match — compatible Nadi, Gana, and Yoni. Highly auspicious by Vedic tradition.';

  const highlights: string[] = [];
  if (breakdown.nadi.score === 8)   highlights.push('clear Nadi');
  if (breakdown.gana.score === 6)   highlights.push('matching Gana');
  if (breakdown.yoni.score >= 3)    highlights.push('compatible Yoni');
  if (breakdown.graha.score >= 4)   highlights.push('friendly planetary lords');
  if (breakdown.bhakoot.score === 7) highlights.push('auspicious Moon signs');

  const warns: string[] = [];
  if (ganaDosha)    warns.push('Gana mismatch');
  if (bhakootDosha) warns.push('Bhakoot Dosha');

  if (total >= 24) {
    const h = highlights.slice(0, 2).join(' and ');
    return `Strong compatibility — ${h || 'good alignment across Kutas'}.`;
  }
  if (total >= 18) {
    const w = warns.length ? ` Note: ${warns.join(', ')}.` : '';
    return `Good match — compatible core values and community alignment.${w}`;
  }
  if (warns.length) {
    return `Moderate alignment — ${warns.join(', ')} detected. Review with family.`;
  }
  return 'Moderate alignment — additional family consultation recommended.';
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: calculateGunaScore
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the full Ashtakoot Guna Milan score between two profiles.
 * Convention: profile A = groom, profile B = bride (or first/second profile).
 * For same-sex or unknown gender, we treat the first argument as "groom" role.
 */
export function calculateGunaScore(a: AshtakootProfile, b: AshtakootProfile): GunaResult {
  // Determine groom/bride by gender
  let groom = a, bride = b;
  if (a.gender === 'Female' && b.gender === 'Male') { groom = b; bride = a; }

  // Resolve Nakshatra rows
  const groomNk = findNakshatra(groom.nakshatra_id ?? groom.nakshatra);
  const brideNk  = findNakshatra(bride.nakshatra_id  ?? bride.nakshatra);

  // Resolve Raasi rows
  const groomRaasi = resolveRaasi(groom);
  const brideRaasi  = resolveRaasi(bride);

  // Sagothra check — immediate disqualification
  const sagothra = isSagothra(a, b);
  if (sagothra) {
    const breakdown: KutaBreakdown = {
      varna:   { score: 0, max: 2 },
      vashya:  { score: 0, max: 2 },
      tara:    { score: 0, max: 3 },
      yoni:    { score: 0, max: 4 },
      graha:   { score: 0, max: 5 },
      gana:    { score: 0, max: 6 },
      bhakoot: { score: 0, max: 7 },
      nadi:    { score: 0, max: 8 },
    };
    return {
      total: 0, breakdown, sagothra: true,
      nadiDosha: false, bhakootDosha: false, ganaDosha: false,
      label: 'Sagothra',
      summaryLine: 'Same Gothra — not permitted by Vedic tradition.',
      legacyScore: 0,
    };
  }

  // Calculate all 8 Kutas
  const varna   = calcVarna(groomNk, brideNk);
  const vashya  = calcVashya(groomRaasi, brideRaasi);
  const tara    = calcTara(groomNk, brideNk);
  const yoni    = calcYoni(groomNk, brideNk);
  const graha   = calcGraha(groomRaasi, brideRaasi);
  const gana    = calcGana(groomNk, brideNk);
  const { score: bhakoot, dosha: bhakootDosha } = calcBhakoot(groomRaasi, brideRaasi);
  const { score: nadi,    dosha: nadiDosha    } = calcNadi(groomNk, brideNk);
  const ganaDosha = gana === 0;

  const breakdown: KutaBreakdown = {
    varna:   { score: varna,   max: 2 },
    vashya:  { score: vashya,  max: 2 },
    tara:    { score: tara,    max: 3 },
    yoni:    { score: yoni,    max: 4 },
    graha:   { score: graha,   max: 5 },
    gana:    { score: gana,    max: 6 },
    bhakoot: { score: bhakoot, max: 7 },
    nadi:    { score: nadi,    max: 8 },
  };

  const total = varna + vashya + tara + yoni + graha + gana + bhakoot + nadi;

  let label: string;
  if (total >= 27) label = 'Uttama';
  else if (total >= 18) label = 'Madhyama';
  else label = 'Alpa';

  const summaryLine = buildSummaryLine(total, breakdown, nadiDosha, bhakootDosha, ganaDosha, false);

  // Legacy score: scale /36 → /99 for existing UI that shows a number
  const legacyScore = nadiDosha || sagothra ? 0 : Math.round((total / 36) * 99);

  return { total, breakdown, sagothra, nadiDosha, bhakootDosha, ganaDosha, label, summaryLine, legacyScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY SHIM — keeps existing dashboard/card code working unchanged
// ─────────────────────────────────────────────────────────────────────────────

export type { AshtakootProfile as Profile };

export function calculateMatchScore(me: AshtakootProfile, them: AshtakootProfile): number {
  return calculateGunaScore(me, them).legacyScore;
}

export function getMatchColor(score: number): string {
  if (score === 0)  return 'text-red-500';
  if (score >= 75)  return 'text-emerald-400';
  if (score >= 50)  return 'text-haldi-400';
  if (score >= 28)  return 'text-yellow-500';
  return 'text-stone-400';
}

export function getMatchLabel(score: number): string {
  if (score === 0)  return 'Incompatible (Sagothra / Nadi Dosha)';
  if (score >= 75)  return 'Uttama — Excellent Match';
  if (score >= 50)  return 'Madhyama — Good Match';
  if (score >= 28)  return 'Alpa — Moderate';
  return 'Low Compatibility';
}

export function shouldFillHeart(score: number): boolean {
  return score >= 50;
}
