/**
 * utils/vedic-data.ts
 * Pravara — Complete Vedic Reference Data
 *
 * All 27 Nakshatras with full Ashtakoot Kuta attributes,
 * 12 Raasis, Yoni compatibility matrix, Planetary friendship matrix.
 *
 * These are immutable constants — never derive from user free text.
 * All matching logic in matchEngine.ts reads from here.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type Gana     = 'Deva' | 'Manushya' | 'Rakshasa';
export type Nadi     = 'Vata' | 'Pitta' | 'Kapha';
export type Yoni     = 'Horse' | 'Elephant' | 'Sheep' | 'Serpent' | 'Dog' | 'Cat' |
                       'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Deer' | 'Monkey' |
                       'Mongoose' | 'Lion';
export type Varna    = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type Planet   = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
export type Vashya   = 'Manava' | 'Vanachara' | 'Chatushpada' | 'Jalchara' | 'Kita';
export type PlanetRelation = 'Friend' | 'Neutral' | 'Enemy';

export interface Nakshatra {
  id: number;           // 1–27
  name: string;         // canonical spelling
  altNames: string[];   // alternate spellings for fuzzy lookup
  raasi: string;        // primary Raasi
  raasi2?: string;      // some Nakshatras span two Raasis
  pada: 4;              // always 4 padas
  gana: Gana;
  nadi: Nadi;
  yoni: Yoni;
  varna: Varna;
  lord: Planet;         // ruling planet
}

export interface Raasi {
  id: number;           // 1–12
  name: string;
  altNames: string[];
  lord: Planet;
  vashya: Vashya;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
}

// ─────────────────────────────────────────────────────────────────────────────
// 27 NAKSHATRAS — Complete with all Kuta attributes
// ─────────────────────────────────────────────────────────────────────────────

export const NAKSHATRAS: Nakshatra[] = [
  {
    id: 1, name: 'Ashwini', altNames: ['Aswini', 'Ashvini', 'Aswani'],
    raasi: 'Mesha', pada: 4,
    gana: 'Deva', nadi: 'Vata', yoni: 'Horse', varna: 'Vaishya', lord: 'Ketu' as any,
  },
  {
    id: 2, name: 'Bharani', altNames: ['Bharini', 'Bhorani'],
    raasi: 'Mesha', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Elephant', varna: 'Shudra', lord: 'Venus',
  },
  {
    id: 3, name: 'Krittika', altNames: ['Karthika', 'Kartika', 'Krithika'],
    raasi: 'Mesha', raasi2: 'Vrishabha', pada: 4,
    gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Sheep', varna: 'Brahmin', lord: 'Sun',
  },
  {
    id: 4, name: 'Rohini', altNames: ['Rohani'],
    raasi: 'Vrishabha', pada: 4,
    gana: 'Manushya', nadi: 'Kapha', yoni: 'Serpent', varna: 'Shudra', lord: 'Moon',
  },
  {
    id: 5, name: 'Mrigashira', altNames: ['Mrigasira', 'Mrugasira', 'Mrigashirsha', 'Mrigasheesha'],
    raasi: 'Vrishabha', raasi2: 'Mithuna', pada: 4,
    gana: 'Deva', nadi: 'Pitta', yoni: 'Serpent', varna: 'Farmer' as any, lord: 'Mars',
  },
  {
    id: 6, name: 'Ardra', altNames: ['Arudra', 'Thiruvathira'],
    raasi: 'Mithuna', pada: 4,
    gana: 'Manushya', nadi: 'Vata', yoni: 'Dog', varna: 'Butcher' as any, lord: 'Rahu' as any,
  },
  {
    id: 7, name: 'Punarvasu', altNames: ['Punarpoosam', 'Punarpusam'],
    raasi: 'Mithuna', raasi2: 'Karka', pada: 4,
    gana: 'Deva', nadi: 'Vata', yoni: 'Cat', varna: 'Vaishya', lord: 'Jupiter',
  },
  {
    id: 8, name: 'Pushya', altNames: ['Poosam', 'Pushyam', 'Pooyam'],
    raasi: 'Karka', pada: 4,
    gana: 'Deva', nadi: 'Pitta', yoni: 'Sheep', varna: 'Kshatriya', lord: 'Saturn',
  },
  {
    id: 9, name: 'Ashlesha', altNames: ['Ayilyam', 'Aslesha', 'Ashlesha'],
    raasi: 'Karka', pada: 4,
    gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Cat', varna: 'Shudra' as any, lord: 'Mercury',
  },
  {
    id: 10, name: 'Magha', altNames: ['Makha', 'Magam'],
    raasi: 'Simha', pada: 4,
    gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Rat', varna: 'Shudra', lord: 'Ketu' as any,
  },
  {
    id: 11, name: 'Purva Phalguni', altNames: ['Pubba', 'Pooram', 'Puram', 'Purva Phalguni'],
    raasi: 'Simha', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Rat', varna: 'Brahmin', lord: 'Venus',
  },
  {
    id: 12, name: 'Uttara Phalguni', altNames: ['Uttara', 'Uthiram', 'Uttara Phalguni'],
    raasi: 'Simha', raasi2: 'Kanya', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Cow', varna: 'Kshatriya', lord: 'Sun',
  },
  {
    id: 13, name: 'Hasta', altNames: ['Hastam', 'Atham'],
    raasi: 'Kanya', pada: 4,
    gana: 'Deva', nadi: 'Pitta', yoni: 'Buffalo', varna: 'Vaishya', lord: 'Moon',
  },
  {
    id: 14, name: 'Chitra', altNames: ['Chithra', 'Chithirai'],
    raasi: 'Kanya', raasi2: 'Tula', pada: 4,
    gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Tiger', varna: 'Farmer' as any, lord: 'Mars',
  },
  {
    id: 15, name: 'Swati', altNames: ['Swathi', 'Chothi'],
    raasi: 'Tula', pada: 4,
    gana: 'Deva', nadi: 'Kapha', yoni: 'Buffalo', varna: 'Butcher' as any, lord: 'Rahu' as any,
  },
  {
    id: 16, name: 'Vishakha', altNames: ['Visakha', 'Vishakam'],
    raasi: 'Tula', raasi2: 'Vrischika', pada: 4,
    gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Tiger', varna: 'Shudra' as any, lord: 'Jupiter',
  },
  {
    id: 17, name: 'Anuradha', altNames: ['Anusham', 'Anizham'],
    raasi: 'Vrischika', pada: 4,
    gana: 'Deva', nadi: 'Pitta', yoni: 'Deer', varna: 'Shudra', lord: 'Saturn',
  },
  {
    id: 18, name: 'Jyeshtha', altNames: ['Kettai', 'Triketta'],
    raasi: 'Vrischika', pada: 4,
    gana: 'Rakshasa', nadi: 'Vata', yoni: 'Deer', varna: 'Farmer' as any, lord: 'Mercury',
  },
  {
    id: 19, name: 'Mula', altNames: ['Moola', 'Moolam'],
    raasi: 'Dhanu', pada: 4,
    gana: 'Rakshasa', nadi: 'Kapha', yoni: 'Dog', varna: 'Butcher' as any, lord: 'Ketu' as any,
  },
  {
    id: 20, name: 'Purva Ashadha', altNames: ['Pooradam', 'Purvashada', 'Purvashadha'],
    raasi: 'Dhanu', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Monkey', varna: 'Brahmin', lord: 'Venus',
  },
  {
    id: 21, name: 'Uttara Ashadha', altNames: ['Uttaradam', 'Uttarashada', 'Uttarashadha'],
    raasi: 'Dhanu', raasi2: 'Makara', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Mongoose', varna: 'Kshatriya', lord: 'Sun',
  },
  {
    id: 22, name: 'Shravana', altNames: ['Sravanam', 'Thiruvonam', 'Sravana'],
    raasi: 'Makara', pada: 4,
    gana: 'Deva', nadi: 'Kapha', yoni: 'Monkey', varna: 'Shudra' as any, lord: 'Moon',
  },
  {
    id: 23, name: 'Dhanishtha', altNames: ['Dhanista', 'Avittam', 'Shravishtha'],
    raasi: 'Makara', raasi2: 'Kumbha', pada: 4,
    gana: 'Rakshasa', nadi: 'Pitta', yoni: 'Lion', varna: 'Farmer' as any, lord: 'Mars',
  },
  {
    id: 24, name: 'Shatabhisha', altNames: ['Sadayam', 'Shatataraka', 'Shatabhisha'],
    raasi: 'Kumbha', pada: 4,
    gana: 'Rakshasa', nadi: 'Vata', yoni: 'Horse', varna: 'Butcher' as any, lord: 'Rahu' as any,
  },
  {
    id: 25, name: 'Purva Bhadrapada', altNames: ['Poorattathi', 'Purvabhadra', 'Purva Bhadra'],
    raasi: 'Kumbha', raasi2: 'Meena', pada: 4,
    gana: 'Manushya', nadi: 'Vata', yoni: 'Lion', varna: 'Brahmin', lord: 'Jupiter',
  },
  {
    id: 26, name: 'Uttara Bhadrapada', altNames: ['Uttarattathi', 'Uttarabhadra', 'Uttara Bhadra'],
    raasi: 'Meena', pada: 4,
    gana: 'Manushya', nadi: 'Pitta', yoni: 'Cow', varna: 'Kshatriya', lord: 'Saturn',
  },
  {
    id: 27, name: 'Revati', altNames: ['Revathi'],
    raasi: 'Meena', pada: 4,
    gana: 'Deva', nadi: 'Kapha', yoni: 'Elephant', varna: 'Shudra', lord: 'Mercury',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12 RAASIS (Moon Signs)
// ─────────────────────────────────────────────────────────────────────────────

export const RAASIS: Raasi[] = [
  { id: 1,  name: 'Mesha',     altNames: ['Aries', 'Mesh'],       lord: 'Mars',    vashya: 'Chatushpada', element: 'Fire'  },
  { id: 2,  name: 'Vrishabha', altNames: ['Taurus', 'Vrisabha'],  lord: 'Venus',   vashya: 'Chatushpada', element: 'Earth' },
  { id: 3,  name: 'Mithuna',   altNames: ['Gemini', 'Mithun'],    lord: 'Mercury', vashya: 'Manava',      element: 'Air'   },
  { id: 4,  name: 'Karka',     altNames: ['Cancer', 'Karkata'],   lord: 'Moon',    vashya: 'Jalchara',    element: 'Water' },
  { id: 5,  name: 'Simha',     altNames: ['Leo', 'Singh'],        lord: 'Sun',     vashya: 'Vanachara',   element: 'Fire'  },
  { id: 6,  name: 'Kanya',     altNames: ['Virgo', 'Kanni'],      lord: 'Mercury', vashya: 'Manava',      element: 'Earth' },
  { id: 7,  name: 'Tula',      altNames: ['Libra', 'Thula'],      lord: 'Venus',   vashya: 'Manava',      element: 'Air'   },
  { id: 8,  name: 'Vrischika', altNames: ['Scorpio', 'Vrishchik'],lord: 'Mars',    vashya: 'Kita',        element: 'Water' },
  { id: 9,  name: 'Dhanu',     altNames: ['Sagittarius', 'Dhan'], lord: 'Jupiter', vashya: 'Chatushpada', element: 'Fire'  },
  { id: 10, name: 'Makara',    altNames: ['Capricorn', 'Makar'],  lord: 'Saturn',  vashya: 'Jalchara',    element: 'Earth' },
  { id: 11, name: 'Kumbha',    altNames: ['Aquarius', 'Kumbh'],   lord: 'Saturn',  vashya: 'Manava',      element: 'Air'   },
  { id: 12, name: 'Meena',     altNames: ['Pisces', 'Meen'],      lord: 'Jupiter', vashya: 'Jalchara',    element: 'Water' },
];

// ─────────────────────────────────────────────────────────────────────────────
// YONI COMPATIBILITY MATRIX
// Key format: "YoniA|YoniB" → score (0–4). Always store smaller index first.
// ─────────────────────────────────────────────────────────────────────────────

const Y = (a: Yoni, b: Yoni, score: number): [string, number] => {
  const key = [a, b].sort().join('|');
  return [key, score];
};

export const YONI_COMPAT: Record<string, number> = Object.fromEntries([
  // Same yoni = 4 (self-pairs)
  Y('Horse',    'Horse',    4),
  Y('Elephant', 'Elephant', 4),
  Y('Sheep',    'Sheep',    4),
  Y('Serpent',  'Serpent',  4),
  Y('Dog',      'Dog',      4),
  Y('Cat',      'Cat',      4),
  Y('Rat',      'Rat',      4),
  Y('Cow',      'Cow',      4),
  Y('Buffalo',  'Buffalo',  4),
  Y('Tiger',    'Tiger',    4),
  Y('Deer',     'Deer',     4),
  Y('Monkey',   'Monkey',   4),
  Y('Mongoose', 'Mongoose', 4),
  Y('Lion',     'Lion',     4),

  // Sworn enemy pairs = 0
  Y('Cat',      'Rat',      0),
  Y('Dog',      'Deer',     0),
  Y('Cow',      'Tiger',    0),
  Y('Mongoose', 'Serpent',  0),
  Y('Horse',    'Buffalo',  0),
  Y('Elephant', 'Lion',     0),
  Y('Monkey',   'Sheep',    0),

  // Friendly pairs = 3
  Y('Horse',    'Sheep',    3),
  Y('Horse',    'Deer',     3),
  Y('Elephant', 'Cow',      3),
  Y('Elephant', 'Sheep',    3),
  Y('Serpent',  'Mongoose', 2), // actually enemy but partial
  Y('Dog',      'Cat',      3),
  Y('Rat',      'Monkey',   3),
  Y('Cow',      'Elephant', 3),
  Y('Buffalo',  'Deer',     3),
  Y('Tiger',    'Lion',     3),
  Y('Monkey',   'Lion',     3),
]);

// Fallback for any unlisted pair = 2 (neutral)
export function getYoniScore(a: Yoni, b: Yoni): number {
  const key = [a, b].sort().join('|');
  return YONI_COMPAT[key] ?? 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANETARY FRIENDSHIP MATRIX
// ─────────────────────────────────────────────────────────────────────────────

type FriendMap = Record<Planet, Record<Planet, PlanetRelation>>;

export const PLANET_FRIEND: FriendMap = {
  Sun:     { Sun: 'Friend', Moon: 'Friend', Mars: 'Friend', Mercury: 'Neutral', Jupiter: 'Friend',  Venus: 'Enemy',  Saturn: 'Enemy'  },
  Moon:    { Sun: 'Friend', Moon: 'Friend', Mars: 'Neutral',Mercury: 'Friend',  Jupiter: 'Friend',  Venus: 'Neutral',Saturn: 'Neutral'},
  Mars:    { Sun: 'Friend', Moon: 'Neutral',Mars: 'Friend', Mercury: 'Enemy',   Jupiter: 'Friend',  Venus: 'Neutral',Saturn: 'Neutral'},
  Mercury: { Sun: 'Neutral',Moon: 'Neutral',Mars: 'Neutral',Mercury: 'Friend',  Jupiter: 'Neutral', Venus: 'Friend', Saturn: 'Neutral'},
  Jupiter: { Sun: 'Friend', Moon: 'Friend', Mars: 'Friend', Mercury: 'Enemy',   Jupiter: 'Friend',  Venus: 'Enemy',  Saturn: 'Neutral'},
  Venus:   { Sun: 'Neutral',Moon: 'Neutral',Mars: 'Neutral',Mercury: 'Friend',  Jupiter: 'Neutral', Venus: 'Friend', Saturn: 'Friend' },
  Saturn:  { Sun: 'Enemy',  Moon: 'Neutral',Mars: 'Neutral',Mercury: 'Friend',  Jupiter: 'Neutral', Venus: 'Friend', Saturn: 'Friend' },
};

export function getPlanetRelationScore(a: Planet, b: Planet): number {
  const rel = PLANET_FRIEND[a]?.[b] ?? 'Neutral';
  return rel === 'Friend' ? 1 : rel === 'Neutral' ? 0.5 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// GANA COMPATIBILITY TABLE (Kuta 6)
// rows = groom's Gana, cols = bride's Gana → score out of 6
// ─────────────────────────────────────────────────────────────────────────────

export const GANA_COMPAT: Record<Gana, Record<Gana, number>> = {
  Deva:     { Deva: 6, Manushya: 5, Rakshasa: 0 },
  Manushya: { Deva: 0, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 0, Manushya: 0, Rakshasa: 6 },
};

// ─────────────────────────────────────────────────────────────────────────────
// VASHYA COMPATIBILITY (Kuta 2)
// ─────────────────────────────────────────────────────────────────────────────

export const VASHYA_COMPAT: Record<Vashya, Record<Vashya, number>> = {
  Manava:      { Manava: 2, Vanachara: 0, Chatushpada: 1, Jalchara: 0, Kita: 0 },
  Vanachara:   { Manava: 0, Vanachara: 2, Chatushpada: 1, Jalchara: 0, Kita: 0 },
  Chatushpada: { Manava: 1, Vanachara: 1, Chatushpada: 2, Jalchara: 1, Kita: 0 },
  Jalchara:    { Manava: 0, Vanachara: 0, Chatushpada: 1, Jalchara: 2, Kita: 1 },
  Kita:        { Manava: 0, Vanachara: 0, Chatushpada: 0, Jalchara: 1, Kita: 2 },
};

// ─────────────────────────────────────────────────────────────────────────────
// BHAKOOT DOSHA PAIRS (Raasi ID positions — 1-indexed)
// Pairs that result in 0 score
// ─────────────────────────────────────────────────────────────────────────────

export const BHAKOOT_DOSHA_PAIRS = new Set([
  '2-12', '12-2',   // wealth conflict
  '5-9',  '9-5',    // children conflict
  '6-8',  '8-6',    // health/longevity conflict
]);

export function getBhakootScore(raasi1Id: number, raasi2Id: number): number {
  // Calculate relative positions
  const fwd = ((raasi2Id - raasi1Id + 12) % 12) + 1;  // 1–12
  const rev = ((raasi1Id - raasi2Id + 12) % 12) + 1;

  const key = `${fwd}-${rev}`;
  if (BHAKOOT_DOSHA_PAIRS.has(key)) return 0;
  if (raasi1Id === raasi2Id) return 7; // same sign
  return 7; // all other positions = full score
}

// ─────────────────────────────────────────────────────────────────────────────
// TARA KUTA — score based on Nakshatra count distance
// ─────────────────────────────────────────────────────────────────────────────

const TARA_SCORES = [0, 3, 0, 3, 0, 3, 0, 3, 3]; // index = (count % 9) - 1

export function getTaraScore(fromId: number, toId: number): number {
  // Count Nakshatras from 'from' to 'to', 1-indexed
  const count = ((toId - fromId + 27) % 27) + 1;
  const rem = count % 9;
  return TARA_SCORES[rem === 0 ? 8 : rem - 1] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Find Nakshatra by exact name or any alternate name (case-insensitive) */
export function findNakshatra(name: string): Nakshatra | undefined {
  const q = name.toLowerCase().trim();
  return NAKSHATRAS.find(n =>
    n.name.toLowerCase() === q ||
    n.altNames.some(a => a.toLowerCase() === q)
  );
}

/** Find Raasi by name or alternate name (case-insensitive) */
export function findRaasi(name: string): Raasi | undefined {
  const q = name.toLowerCase().trim();
  return RAASIS.find(r =>
    r.name.toLowerCase() === q ||
    r.altNames.some(a => a.toLowerCase() === q)
  );
}

/** Get Raasi for a given Nakshatra (primary Raasi) */
export function getNakshatraRaasi(nakshatraId: number): Raasi | undefined {
  const n = NAKSHATRAS.find(x => x.id === nakshatraId);
  if (!n) return undefined;
  return findRaasi(n.raasi);
}
