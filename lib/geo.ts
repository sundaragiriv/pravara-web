/**
 * Where Pravara currently serves.
 *
 * The platform is built for the United States, Canada and India — that is where
 * payments will work, where the community research is grounded, and where the
 * founding circle is being formed. Someone arriving from elsewhere should be
 * told plainly rather than allowed to fill in a form for a service that cannot
 * reach them.
 *
 * "Politely" is the operative word. A visitor from Sydney or Dubai is very
 * often diaspora from exactly the families this is built for, and the message
 * they get should read as "not yet" rather than "not you" — with a way to leave
 * an address so they hear when it changes.
 */

export const SERVED_COUNTRIES = ["US", "CA", "IN"] as const;

export type ServedCountry = (typeof SERVED_COUNTRIES)[number];

const SERVED = new Set<string>(SERVED_COUNTRIES);

/**
 * Whether we serve this country.
 *
 * An unknown country is treated as served. Geo headers are missing on local
 * development, on some proxies, and for a fraction of real traffic, and turning
 * away a genuine visitor because a header did not arrive is a far worse mistake
 * than showing the site to someone outside the launch markets.
 */
export function isServed(countryCode: string | null | undefined): boolean {
  if (!countryCode) return true;
  return SERVED.has(countryCode.toUpperCase());
}

/** Human names, for saying "we serve X, Y and Z" without a lookup table. */
export const SERVED_COUNTRY_NAMES: Record<ServedCountry, string> = {
  US: "the United States",
  CA: "Canada",
  IN: "India",
};

export function servedCountryList(): string {
  const names = SERVED_COUNTRIES.map((c) => SERVED_COUNTRY_NAMES[c]);
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
