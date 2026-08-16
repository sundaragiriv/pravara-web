/**
 * utils/community-data.ts
 * Pravara — Community Hierarchy & Gothra Reference Data
 *
 * Language → Community → SubCommunity (controlled vocabulary)
 * Gothra list with alternate spellings for EXACT resolution.
 *
 * Used by onboarding dropdowns and match engine community scoring.
 * Never accept free text for these fields — always resolve to an ID.
 *
 * The header used to say "fuzzy resolution". It never was fuzzy, and it must
 * never become fuzzy: see the note on matchAll() below for why a near-miss on
 * one of these names is not a typo to be helpfully corrected.
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
    // The Bengal derivation is a contested medieval folk etymology, not
    // settled history, and "highly respected lineage" ranks a community in
    // copy the user reads. Documented origin is the Kurukshetra region.
    description: 'North Indian, traditionally of the Kurukshetra region',
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
    // 'chitragupta' was listed here and is wrong: Chitragupta is the divine
    // progenitor of the Kayastha caste, not a Chitpavan alias. It resolved a
    // Kayastha typing their own tradition into a Brahmin community.
    altNames: ['chitpavan', 'konkanastha'],
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
  // 'koushika' was listed here as well as under Kaushika (#16). Because the
  // lookup returned the first match, every Kaushika who typed that spelling was
  // stored as Kaundinya — a different gotra, and therefore a different answer to
  // the one question this data exists to answer. Kaundinya's genuine variants
  // are the three below.
  { id: 9,  name: 'Kaundinya',     altNames: ['kowdilya', 'kondilya'],                              vedaShakha: 'Yajurveda' },
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

/**
 * What a lookup can honestly conclude.
 *
 * The old helpers returned `T | undefined` and used `.find()`, which cannot
 * express "this string belongs to two different things". So when it did — and
 * it did, for `koushika` — the caller silently got whichever entry happened to
 * be declared first. An ambiguous name has to be a distinct outcome, because
 * the only correct response to it is to ask rather than to pick.
 */
export type Resolution<T> =
  | { status: 'resolved'; match: T }
  | { status: 'ambiguous'; candidates: T[] }
  | { status: 'unknown' };

/**
 * EXACT match on the canonical name or one of the listed alt-names. Case and
 * surrounding whitespace are ignored; nothing else is.
 *
 * Deliberately not fuzzy, and this must stay that way. Community and lineage
 * names that differ by one character routinely belong to entirely separate
 * groups — in Himachal `Hali` is a Scheduled Caste while `Halbaha` is a Brahmin
 * group, and bridging them would assign someone a caste status they do not
 * hold, which in India touches reservation entitlement. A "did you mean…?" is
 * precisely the wrong kindness here.
 */
function matchAll<T extends { name: string; altNames: string[] }>(
  rows: T[],
  name: string,
): T[] {
  const q = name.toLowerCase().trim();
  if (!q) return [];
  return rows.filter(
    row => row.name.toLowerCase() === q || row.altNames.some(a => a.toLowerCase() === q),
  );
}

function toResolution<T>(hits: T[]): Resolution<T> {
  if (hits.length === 1) return { status: 'resolved', match: hits[0] };
  if (hits.length > 1) return { status: 'ambiguous', candidates: hits };
  return { status: 'unknown' };
}

export function resolveGothra(name: string): Resolution<Gothra> {
  return toResolution(matchAll(GOTHRAS, name));
}

/**
 * Scope by language wherever it is known. Both community-level collisions in
 * the current data (`smartha` across Tamil Iyer and Kannada Smartha, `saraswat`
 * across the Hindi and Marathi entries) disappear once the language is applied,
 * which is why the picker asks for language first.
 */
export function resolveCommunity(
  name: string,
  options: { languageId?: number } = {},
): Resolution<Community> {
  const scope =
    options.languageId === undefined
      ? COMMUNITIES
      : COMMUNITIES.filter(c => c.languageId === options.languageId);
  return toResolution(matchAll(scope, name));
}

/** Same idea one level down — `mulakanadu` exists under both Vaidiki and Iyer. */
export function resolveSubCommunity(
  name: string,
  options: { communityId?: number } = {},
): Resolution<SubCommunity> {
  const scope =
    options.communityId === undefined
      ? SUB_COMMUNITIES
      : SUB_COMMUNITIES.filter(s => s.communityId === options.communityId);
  return toResolution(matchAll(scope, name));
}

export function resolveLanguage(name: string): Resolution<Language> {
  return toResolution(matchAll(LANGUAGES, name));
}

export function getCommunitiesForLanguage(languageId: number): Community[] {
  return COMMUNITIES.filter(c => c.languageId === languageId);
}

export function getSubCommunitiesForCommunity(communityId: number): SubCommunity[] {
  return SUB_COMMUNITIES.filter(s => s.communityId === communityId);
}

/**
 * Older callers. These now return undefined when a name is ambiguous rather
 * than guessing — refusing to answer is the safe failure for this data, and a
 * caller that wants to offer the choice should use the resolver instead.
 */
export function findGothra(name: string): Gothra | undefined {
  const result = resolveGothra(name);
  return result.status === 'resolved' ? result.match : undefined;
}

export function findLanguage(name: string): Language | undefined {
  const result = resolveLanguage(name);
  return result.status === 'resolved' ? result.match : undefined;
}

export function findCommunity(name: string): Community | undefined {
  const result = resolveCommunity(name);
  return result.status === 'resolved' ? result.match : undefined;
}
