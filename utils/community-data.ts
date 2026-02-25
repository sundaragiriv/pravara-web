/**
 * utils/community-data.ts
 * Pravara — Community Hierarchy & Gothra Reference Data
 *
 * Language → Community → SubCommunity (controlled vocabulary)
 * Gothra list with alternate spellings for fuzzy resolution.
 *
 * Used by onboarding dropdowns and match engine community scoring.
 * Never accept free text for these fields — always resolve to an ID.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Language {
  id: number;
  name: string;
  altNames: string[];
}

export interface Community {
  id: number;
  languageId: number;
  name: string;
  altNames: string[];
  description?: string;
}

export interface SubCommunity {
  id: number;
  communityId: number;
  name: string;
  altNames: string[];
}

export interface Gothra {
  id: number;
  name: string;                // canonical
  altNames: string[];          // variants & misspellings
  vedaShakha?: string;         // associated Veda branch (optional context)
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES: Language[] = [
  { id: 1, name: 'Telugu',   altNames: ['telugu', 'andhra'] },
  { id: 2, name: 'Tamil',    altNames: ['tamil', 'tamizh'] },
  { id: 3, name: 'Kannada',  altNames: ['kannada', 'kannadiga'] },
  { id: 4, name: 'Hindi',    altNames: ['hindi', 'north indian', 'hindustani'] },
  { id: 5, name: 'Marathi',  altNames: ['marathi', 'maharashtrian'] },
  { id: 6, name: 'Sanskrit', altNames: ['sanskrit'] },   // for pandit families
  { id: 7, name: 'Other',    altNames: ['other'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITIES  (language_id → community)
// ─────────────────────────────────────────────────────────────────────────────

export const COMMUNITIES: Community[] = [
  // ── Telugu (id 1) ────────────────────────────────────────────────────────
  {
    id: 101, languageId: 1,
    name: 'Niyogi',
    altNames: ['niyogi', 'niyogi brahmin'],
    description: 'Secular/administrative Brahmins of Andhra & Telangana',
  },
  {
    id: 102, languageId: 1,
    name: 'Vaidiki',
    altNames: ['vaidiki', 'vaidika', 'vaidiki brahmin'],
    description: 'Priestly Brahmins, traditionally temple-oriented',
  },
  {
    id: 103, languageId: 1,
    name: 'Srivaishnava',
    altNames: ['srivaishnava', 'sri vaishnava', 'telugu iyengar'],
    description: 'Vaishnava Brahmins — Telugu counterpart of Iyengar',
  },
  {
    id: 104, languageId: 1,
    name: 'Murikinati',
    altNames: ['murikinati', 'murikinadu'],
  },

  // ── Tamil (id 2) ─────────────────────────────────────────────────────────
  {
    id: 201, languageId: 2,
    name: 'Iyer',
    altNames: ['iyer', 'aiyar', 'smartha'],
    description: 'Smartha Brahmins — followers of Adi Shankaracharya',
  },
  {
    id: 202, languageId: 2,
    name: 'Iyengar',
    altNames: ['iyengar', 'ayyangar', 'sri vaishnava tamil'],
    description: 'Vaishnava Brahmins — followers of Ramanujacharya',
  },
  {
    id: 203, languageId: 2,
    name: 'Gurukkal',
    altNames: ['gurukkal'],
    description: 'Temple priest Brahmins of Tamil Nadu',
  },

  // ── Kannada (id 3) ───────────────────────────────────────────────────────
  {
    id: 301, languageId: 3,
    name: 'Smartha',
    altNames: ['smartha', 'smartha brahmin', 'havyaka', 'hoysala karnataka'],
    description: 'Smartha Brahmins of Karnataka',
  },
  {
    id: 302, languageId: 3,
    name: 'Madhwa',
    altNames: ['madhwa', 'madhva', 'madhwa brahmin'],
    description: 'Followers of Madhvacharya (Dvaita philosophy)',
  },
  {
    id: 303, languageId: 3,
    name: 'Shivalli',
    altNames: ['shivalli', 'tulu brahmin'],
    description: 'Brahmins of Tulu Nadu (coastal Karnataka)',
  },

  // ── Hindi / North Indian (id 4) ──────────────────────────────────────────
  {
    id: 401, languageId: 4,
    name: 'Gaur',
    altNames: ['gaur', 'gaur brahmin', 'gaud brahmin'],
    description: 'From Gaud (Bengal/UP) region — highly respected lineage',
  },
  {
    id: 402, languageId: 4,
    name: 'Kanyakubja',
    altNames: ['kanyakubja', 'kanaujia', 'kannauj brahmin'],
    description: 'From Kanpur / Kannauj region of UP',
  },
  {
    id: 403, languageId: 4,
    name: 'Saryupareen',
    altNames: ['saryupareen', 'saryupari', 'ayodhya brahmin'],
    description: 'From Sarayu river belt — Ayodhya region',
  },
  {
    id: 404, languageId: 4,
    name: 'Maithil',
    altNames: ['maithil', 'maithili', 'bihar brahmin'],
    description: 'From Mithila (Bihar / Eastern UP)',
  },
  {
    id: 405, languageId: 4,
    name: 'Kashmiri Pandit',
    altNames: ['kashmiri pandit', 'kashmiri brahmin', 'kp'],
    description: 'Brahmins of Kashmir valley',
  },
  {
    id: 406, languageId: 4,
    name: 'Saraswat',
    altNames: ['saraswat', 'saraswat brahmin'],
    description: 'Brahmins tracing lineage to Saraswati river',
  },

  // ── Marathi (id 5) ───────────────────────────────────────────────────────
  {
    id: 501, languageId: 5,
    name: 'Deshastha',
    altNames: ['deshastha', 'deshast', 'desh brahmin'],
    description: 'Brahmins of the Deccan plateau (Desh region)',
  },
  {
    id: 502, languageId: 5,
    name: 'Chitpavan',
    altNames: ['chitpavan', 'konkanastha', 'chitragupta'],
    description: 'Konkan coast Brahmins — historically prominent',
  },
  {
    id: 503, languageId: 5,
    name: 'Karhade',
    altNames: ['karhade', 'karhada'],
  },
  {
    id: 504, languageId: 5,
    name: 'Saraswat',
    altNames: ['saraswat', 'goud saraswat', 'gsb'],
    description: 'Konkani-speaking Brahmins of coastal Maharashtra/Goa',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMMUNITIES
// ─────────────────────────────────────────────────────────────────────────────

export const SUB_COMMUNITIES: SubCommunity[] = [
  // Telugu Niyogi (communityId 101)
  { id: 1011, communityId: 101, name: 'Velanadu Niyogi',   altNames: ['velanadu', 'velnadu'] },
  { id: 1012, communityId: 101, name: 'Kammanadu Niyogi',  altNames: ['kammanadu', 'kammanati'] },
  { id: 1013, communityId: 101, name: 'Telangana Niyogi',  altNames: ['telangana niyogi'] },
  { id: 1014, communityId: 101, name: 'Dravida Niyogi',    altNames: ['dravida', 'dravid niyogi'] },

  // Telugu Vaidiki (communityId 102)
  { id: 1021, communityId: 102, name: 'Vaidiki',           altNames: ['vaidiki', 'vaidika'] },
  { id: 1022, communityId: 102, name: 'Velanadu Vaidiki',  altNames: ['velanadu vaidiki'] },
  { id: 1023, communityId: 102, name: 'Smarta Vaidiki',    altNames: ['smarta vaidiki', 'smartha vaidiki'] },
  { id: 1024, communityId: 102, name: 'Mulakanadu',        altNames: ['mulakanadu', 'mulakanati'] },

  // Tamil Iyer (communityId 201)
  { id: 2011, communityId: 201, name: 'Vadama',            altNames: ['vadama', 'vadamar'] },
  { id: 2012, communityId: 201, name: 'Vathima',           altNames: ['vathima', 'vathimar'] },
  { id: 2013, communityId: 201, name: 'Brihacharanam',     altNames: ['brihacharanam', 'brahachranam'] },
  { id: 2014, communityId: 201, name: 'Ashtasahasram',     altNames: ['ashtasahasram'] },
  { id: 2015, communityId: 201, name: 'Mulakanadu',        altNames: ['mulakanadu', 'mulakanadu iyer'] },

  // Tamil Iyengar (communityId 202)
  { id: 2021, communityId: 202, name: 'Thenkalai',         altNames: ['thenkalai', 'tengalai'] },
  { id: 2022, communityId: 202, name: 'Vadakalai',         altNames: ['vadakalai', 'vatakalai'] },

  // Kannada Smartha (communityId 301)
  { id: 3011, communityId: 301, name: 'Havyaka',           altNames: ['havyaka', 'havika'] },
  { id: 3012, communityId: 301, name: 'Hoysala Karnataka', altNames: ['hoysala', 'hoysala karnataka'] },
  { id: 3013, communityId: 301, name: 'Kota',              altNames: ['kota'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// GOTHRAS — canonical list with alternate spellings
// ─────────────────────────────────────────────────────────────────────────────

export const GOTHRAS: Gothra[] = [
  { id: 1,  name: 'Kashyapa',      altNames: ['kashyap', 'kasyapa', 'kasyap', 'kashyapa'],        vedaShakha: 'Rigveda' },
  { id: 2,  name: 'Bharadwaja',    altNames: ['bharadvaja', 'bhardwaj', 'bharadwaj', 'bardwaj'],   vedaShakha: 'Rigveda' },
  { id: 3,  name: 'Atri',          altNames: ['atri', 'atreyasa'],                                 vedaShakha: 'Rigveda' },
  { id: 4,  name: 'Vishwamitra',   altNames: ['vishvamitra', 'viswamitra', 'vishwamitra'],          vedaShakha: 'Rigveda' },
  { id: 5,  name: 'Gautama',       altNames: ['gautam', 'gotama', 'gautama'],                       vedaShakha: 'Samaveda' },
  { id: 6,  name: 'Jamadagni',     altNames: ['jamadagni', 'jamadagnasa'],                          vedaShakha: 'Rigveda' },
  { id: 7,  name: 'Vasishtha',     altNames: ['vasistha', 'vashishtha', 'vashishth', 'vasishtha'],  vedaShakha: 'Rigveda' },
  { id: 8,  name: 'Agastya',       altNames: ['agasthya', 'agastya', 'agasthyasa'],                 vedaShakha: 'Rigveda' },
  { id: 9,  name: 'Kaundinya',     altNames: ['kaundinya', 'kowdilya', 'kondilya', 'koushika'],     vedaShakha: 'Yajurveda' },
  { id: 10, name: 'Sandilya',      altNames: ['sandilya', 'shandilya', 'shandilya'],                vedaShakha: 'Rigveda' },
  { id: 11, name: 'Parasara',      altNames: ['parashara', 'parasara', 'parashar'],                 vedaShakha: 'Rigveda' },
  { id: 12, name: 'Vatsa',         altNames: ['vatsa', 'vatsasa'],                                  vedaShakha: 'Yajurveda' },
  { id: 13, name: 'Garga',         altNames: ['garga', 'gargasa'],                                  vedaShakha: 'Yajurveda' },
  { id: 14, name: 'Mudgala',       altNames: ['mudgala', 'mudgalasa'],                              vedaShakha: 'Rigveda' },
  { id: 15, name: 'Maitreya',      altNames: ['maitreya', 'maitreyasa'],                            vedaShakha: 'Samaveda' },
  { id: 16, name: 'Kaushika',      altNames: ['kaushik', 'kausika', 'koushika', 'kaushika'],        vedaShakha: 'Rigveda' },
  { id: 17, name: 'Harita',        altNames: ['harita', 'haritasa'],                                vedaShakha: 'Samaveda' },
  { id: 18, name: 'Angirasa',      altNames: ['angiras', 'angirasa', 'angirash'],                   vedaShakha: 'Atharvaveda' },
  { id: 19, name: 'Vatula',        altNames: ['vatula', 'vatulasa'],                                vedaShakha: 'Yajurveda' },
  { id: 20, name: 'Dhananjaya',    altNames: ['dhananjaya', 'dhananjay'],                           vedaShakha: 'Yajurveda' },
  { id: 21, name: 'Srivatsa',      altNames: ['srivatsa', 'srivatsasa'],                            vedaShakha: 'Samaveda' },
  { id: 22, name: 'Upamanya',      altNames: ['upamanya'],                                          vedaShakha: 'Yajurveda' },
  { id: 23, name: 'Lohita',        altNames: ['lohita', 'lohitasa'],                                vedaShakha: 'Yajurveda' },
  { id: 24, name: 'Shaunaka',      altNames: ['shaunaka', 'shaunakasa', 'shaunaka'],                vedaShakha: 'Atharvaveda' },
  { id: 25, name: 'Bhrugu',        altNames: ['bhrigu', 'bhrugu', 'bhargava'],                     vedaShakha: 'Rigveda' },
  { id: 26, name: 'Pulastya',      altNames: ['pulastya'],                                          vedaShakha: 'Rigveda' },
  { id: 27, name: 'Pulaha',        altNames: ['pulaha'],                                            vedaShakha: 'Rigveda' },
  { id: 28, name: 'Kratu',         altNames: ['kratu'],                                             vedaShakha: 'Rigveda' },
  { id: 29, name: 'Marichi',       altNames: ['marichi', 'marich'],                                 vedaShakha: 'Rigveda' },
  { id: 30, name: 'Naidhruva',     altNames: ['naidhruva'],                                         vedaShakha: 'Yajurveda' },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function findGothra(name: string): Gothra | undefined {
  const q = name.toLowerCase().trim();
  return GOTHRAS.find(g =>
    g.name.toLowerCase() === q ||
    g.altNames.some(a => a.toLowerCase() === q)
  );
}

export function findLanguage(name: string): Language | undefined {
  const q = name.toLowerCase().trim();
  return LANGUAGES.find(l =>
    l.name.toLowerCase() === q ||
    l.altNames.some(a => a.toLowerCase() === q)
  );
}

export function getCommunitiesForLanguage(languageId: number): Community[] {
  return COMMUNITIES.filter(c => c.languageId === languageId);
}

export function getSubCommunitiesForCommunity(communityId: number): SubCommunity[] {
  return SUB_COMMUNITIES.filter(s => s.communityId === communityId);
}

export function findCommunity(name: string): Community | undefined {
  const q = name.toLowerCase().trim();
  return COMMUNITIES.find(c =>
    c.name.toLowerCase() === q ||
    c.altNames.some(a => a.toLowerCase() === q)
  );
}
