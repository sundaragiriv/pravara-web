/**
 * States, provinces and union territories for the three markets Pravara serves.
 *
 * Structured rather than free text, for two reasons. A matrimonial search is
 * regional before it is anything else — "Telugu family in New Jersey" is a real
 * query and "NJ" / "New Jersey" / "new jersey " are not three answers to it. And
 * with advertising running into three countries at once, region is the dimension
 * that says which campaign is working; a free-text column cannot be grouped.
 *
 * Cities stay free text deliberately. There are tens of thousands across these
 * three countries, the list would be stale the day it shipped, and unlike state
 * a city rarely decides a match on its own.
 *
 * Codes are the official subdivision codes (ISO 3166-2 without the country
 * prefix) so they can be joined against anything later. Stored as the code, not
 * the label, so a renamed state does not orphan existing rows.
 */

export type Region = { code: string; name: string };

/** 28 states and 8 union territories. */
const INDIA: Region[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

/** 50 states plus the District of Columbia. */
const UNITED_STATES: Region[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

/** 10 provinces and 3 territories. */
const CANADA: Region[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export const REGIONS_BY_COUNTRY: Record<string, Region[]> = {
  IN: INDIA,
  US: UNITED_STATES,
  CA: CANADA,
};

/**
 * What the field is called where the person filling it in lives. An Indian
 * form asking for a "Province" reads as written by someone who has not been
 * there, and the same is true of a Canadian form asking for a "State".
 */
export const REGION_LABEL: Record<string, string> = {
  IN: "State / Union Territory",
  US: "State",
  CA: "Province / Territory",
};

export function regionsFor(country: string): Region[] {
  return REGIONS_BY_COUNTRY[country?.toUpperCase()] ?? [];
}

export function regionLabelFor(country: string): string {
  return REGION_LABEL[country?.toUpperCase()] ?? "State / Region";
}

/**
 * Whether a code is a real subdivision of that country.
 *
 * Countries outside the three served markets have no list, and there a region
 * is accepted as free text — the alternative is refusing a registration from a
 * diaspora family because we have not enumerated their country yet.
 */
export function isValidRegion(country: string, code: string): boolean {
  const list = regionsFor(country);
  if (!list.length) return true;
  return list.some((r) => r.code === code.toUpperCase());
}

/** The printable name, for emails and admin views. */
export function regionName(country: string, code: string): string {
  return regionsFor(country).find((r) => r.code === code?.toUpperCase())?.name ?? code;
}
