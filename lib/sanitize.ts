const MULTISPACE_REGEX = /\s+/g;
const HTML_TAG_REGEX = /<[^>]*>/g;

export function sanitizePlainText(value: string): string {
  return value.replace(HTML_TAG_REGEX, " ").replace(MULTISPACE_REGEX, " ").trim();
}

export function sanitizeProfileValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizePlainText(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? sanitizePlainText(entry) : entry))
      .filter((entry) => entry !== "");
  }

  return value;
}
