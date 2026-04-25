const TRUTHY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  return TRUTHY_ENV_VALUES.has(value.trim().toLowerCase());
}

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export const PRE_LAUNCH_ENABLED = parseBooleanEnv(
  process.env.PRE_LAUNCH_ENABLED ?? process.env.NEXT_PUBLIC_PRE_LAUNCH
);

const ADMIN_EMAIL_ALLOWLIST = new Set(parseCsvEnv(process.env.ADMIN_EMAILS));

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}
