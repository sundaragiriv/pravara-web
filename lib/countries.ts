/**
 * Countries and dial codes for the registration phone field.
 *
 * Codes are ISO 3166-1 alpha-2 — the same values stored in
 * `launch_registrations.country` and `profiles.country`. Storing the code
 * rather than a display name means copy changes and translation never
 * invalidate the data.
 *
 * The three launch markets are pinned to the top of the list because they will
 * be the overwhelming majority of registrations, and making someone scroll past
 * 60 countries to find India is a real cost on a phone. Everything else follows
 * alphabetically.
 */

export type Country = {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  /** E.164 calling code, without the leading +. */
  dial: string;
};

/** Shown first — see note above. */
export const PRIORITY_COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "1" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "IN", name: "India", dial: "91" },
];

/**
 * Everywhere else. Not the full ISO list — this covers the markets a Vedic
 * matrimony platform realistically sees, which is the diaspora plus the major
 * economies. Add a row here if someone reports a missing country; the field
 * validates against this list, so an omission blocks a real registration.
 */
export const OTHER_COUNTRIES: Country[] = [
  { code: "AU", name: "Australia", dial: "61" },
  { code: "AT", name: "Austria", dial: "43" },
  { code: "BH", name: "Bahrain", dial: "973" },
  { code: "BD", name: "Bangladesh", dial: "880" },
  { code: "BE", name: "Belgium", dial: "32" },
  { code: "BR", name: "Brazil", dial: "55" },
  { code: "BN", name: "Brunei", dial: "673" },
  { code: "KH", name: "Cambodia", dial: "855" },
  { code: "CL", name: "Chile", dial: "56" },
  { code: "CN", name: "China", dial: "86" },
  { code: "CO", name: "Colombia", dial: "57" },
  { code: "HR", name: "Croatia", dial: "385" },
  { code: "CY", name: "Cyprus", dial: "357" },
  { code: "CZ", name: "Czechia", dial: "420" },
  { code: "DK", name: "Denmark", dial: "45" },
  { code: "EG", name: "Egypt", dial: "20" },
  { code: "EE", name: "Estonia", dial: "372" },
  { code: "FJ", name: "Fiji", dial: "679" },
  { code: "FI", name: "Finland", dial: "358" },
  { code: "FR", name: "France", dial: "33" },
  { code: "DE", name: "Germany", dial: "49" },
  { code: "GH", name: "Ghana", dial: "233" },
  { code: "GR", name: "Greece", dial: "30" },
  { code: "HK", name: "Hong Kong", dial: "852" },
  { code: "HU", name: "Hungary", dial: "36" },
  { code: "ID", name: "Indonesia", dial: "62" },
  { code: "IE", name: "Ireland", dial: "353" },
  { code: "IL", name: "Israel", dial: "972" },
  { code: "IT", name: "Italy", dial: "39" },
  { code: "JP", name: "Japan", dial: "81" },
  { code: "JO", name: "Jordan", dial: "962" },
  { code: "KE", name: "Kenya", dial: "254" },
  { code: "KW", name: "Kuwait", dial: "965" },
  { code: "LV", name: "Latvia", dial: "371" },
  { code: "LB", name: "Lebanon", dial: "961" },
  { code: "LT", name: "Lithuania", dial: "370" },
  { code: "LU", name: "Luxembourg", dial: "352" },
  { code: "MY", name: "Malaysia", dial: "60" },
  { code: "MV", name: "Maldives", dial: "960" },
  { code: "MT", name: "Malta", dial: "356" },
  { code: "MU", name: "Mauritius", dial: "230" },
  { code: "MX", name: "Mexico", dial: "52" },
  { code: "MA", name: "Morocco", dial: "212" },
  { code: "NP", name: "Nepal", dial: "977" },
  { code: "NL", name: "Netherlands", dial: "31" },
  { code: "NZ", name: "New Zealand", dial: "64" },
  { code: "NG", name: "Nigeria", dial: "234" },
  { code: "NO", name: "Norway", dial: "47" },
  { code: "OM", name: "Oman", dial: "968" },
  { code: "PK", name: "Pakistan", dial: "92" },
  { code: "PH", name: "Philippines", dial: "63" },
  { code: "PL", name: "Poland", dial: "48" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "QA", name: "Qatar", dial: "974" },
  { code: "RO", name: "Romania", dial: "40" },
  { code: "RU", name: "Russia", dial: "7" },
  { code: "SA", name: "Saudi Arabia", dial: "966" },
  { code: "RS", name: "Serbia", dial: "381" },
  { code: "SG", name: "Singapore", dial: "65" },
  { code: "SK", name: "Slovakia", dial: "421" },
  { code: "SI", name: "Slovenia", dial: "386" },
  { code: "ZA", name: "South Africa", dial: "27" },
  { code: "KR", name: "South Korea", dial: "82" },
  { code: "ES", name: "Spain", dial: "34" },
  { code: "LK", name: "Sri Lanka", dial: "94" },
  { code: "SE", name: "Sweden", dial: "46" },
  { code: "CH", name: "Switzerland", dial: "41" },
  { code: "TW", name: "Taiwan", dial: "886" },
  { code: "TZ", name: "Tanzania", dial: "255" },
  { code: "TH", name: "Thailand", dial: "66" },
  { code: "TT", name: "Trinidad & Tobago", dial: "1868" },
  { code: "TR", name: "Türkiye", dial: "90" },
  { code: "UG", name: "Uganda", dial: "256" },
  { code: "UA", name: "Ukraine", dial: "380" },
  { code: "AE", name: "United Arab Emirates", dial: "971" },
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "VN", name: "Vietnam", dial: "84" },
  { code: "ZM", name: "Zambia", dial: "260" },
  { code: "ZW", name: "Zimbabwe", dial: "263" },
];

export const COUNTRIES: Country[] = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string): Country | undefined {
  return BY_CODE.get(code);
}

export function isValidCountryCode(code: string): boolean {
  return BY_CODE.has(code);
}

/** Default selection. US is the primary launch market. */
export const DEFAULT_COUNTRY = "US";

/**
 * Combines a dial code and a national number into E.164 (`+919876543210`).
 * Strips spaces, dashes, brackets, and any duplicated leading dial code — people
 * routinely paste a number that already carries its country code.
 */
export function toE164(dial: string, nationalNumber: string): string {
  let digits = nationalNumber.replace(/\D/g, "");
  if (digits.startsWith(dial)) digits = digits.slice(dial.length);
  // A single leading 0 is a domestic trunk prefix and is dropped in E.164.
  digits = digits.replace(/^0+/, "");
  return `+${dial}${digits}`;
}

/**
 * Loose sanity check, not real phone validation — that needs a library the size
 * of this entire app. National numbers run 4–13 digits worldwide; anything
 * outside that is a typo rather than a foreign format we failed to anticipate.
 */
export function isPlausibleNationalNumber(nationalNumber: string): boolean {
  const digits = nationalNumber.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 4 && digits.length <= 13;
}
