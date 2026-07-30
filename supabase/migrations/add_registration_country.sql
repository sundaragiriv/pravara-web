-- DATA-01 — country on launch_registrations
--
-- Without it we cannot segment, price, or comply per-country, and every one of
-- those needs the value captured at registration rather than inferred later.
-- `profiles` already carries country/state, so this closes the gap on the
-- pre-launch funnel only.
--
-- Nullable and with no default on purpose: existing rows genuinely have an
-- unknown country and should read as unknown, not be silently backfilled with
-- a guess. Adding a nullable column with no default is a catalog-only change in
-- Postgres — no table rewrite, no lock of consequence, safe on a live table.
--
-- Stored as an ISO 3166-1 alpha-2 code ("US", "CA", "IN") rather than a display
-- name so it survives copy changes and translation.

ALTER TABLE public.launch_registrations
  ADD COLUMN IF NOT EXISTS country TEXT;

COMMENT ON COLUMN public.launch_registrations.country IS
  'ISO 3166-1 alpha-2 country code captured at registration. NULL for rows created before 2026-07-30.';

-- Two-letter, uppercase, or nothing. Cheap guard against a display name or a
-- dial code being written here by mistake.
ALTER TABLE public.launch_registrations
  DROP CONSTRAINT IF EXISTS launch_registrations_country_format;

ALTER TABLE public.launch_registrations
  ADD CONSTRAINT launch_registrations_country_format
  CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');

-- Admin cohort views filter by country; without this they sequential-scan.
CREATE INDEX IF NOT EXISTS idx_launch_registrations_country
  ON public.launch_registrations (country)
  WHERE country IS NOT NULL;
