-- ============================================================
-- Add Location, Partner Preferences, and Media fields
-- Safe: uses ADD COLUMN IF NOT EXISTS (Postgres 9.6+)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── LOCATION ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country           TEXT,           -- 'India' | 'USA'
  ADD COLUMN IF NOT EXISTS state             TEXT;           -- state/province within country

-- ── PARTNER PREFERENCES (structured flat columns) ────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS partner_min_age         SMALLINT DEFAULT 22,
  ADD COLUMN IF NOT EXISTS partner_max_age         SMALLINT DEFAULT 36,
  ADD COLUMN IF NOT EXISTS partner_diet            TEXT,
  ADD COLUMN IF NOT EXISTS partner_marital_status  TEXT,
  ADD COLUMN IF NOT EXISTS partner_location_pref   TEXT,
  ADD COLUMN IF NOT EXISTS partner_education_min   TEXT,
  ADD COLUMN IF NOT EXISTS partner_notes           TEXT;     -- free-form partner preferences

-- ── MEDIA ────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS voice_intro_url   TEXT,           -- URL or Supabase storage path
  ADD COLUMN IF NOT EXISTS video_intro_url   TEXT;           -- YouTube/Loom link

-- ── VEDIC EXTRAS ─────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pravara           TEXT,           -- Pravara lineage (optional)
  ADD COLUMN IF NOT EXISTS birth_time        TIME,           -- Time of birth (HH:MM)
  ADD COLUMN IF NOT EXISTS birth_place       TEXT;           -- Place of birth

-- ── IDENTITY ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_manager   TEXT DEFAULT 'Self';  -- Self | Parent | Sibling

-- ── DROP obsolete JSONB column (partner_preferences) if it still exists ──────
-- Uncomment only if you previously had a JSONB partner_preferences column:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS partner_preferences;

-- ── Nakshatra ↔ Raasi constraint (informational cross-check) ─────────────────
-- This ensures rasi is not null when nakshatra is set. Enforced at app layer too.
-- (No DB constraint added — let the app handle soft-fill for flexibility)

-- ── voice_intros storage bucket ──────────────────────────────────────────────
-- Create via Supabase Dashboard → Storage → New Bucket
-- Bucket name: voice_intros
-- Public: true (so audio files can be streamed)
-- File size limit: 10MB
-- Allowed MIME types: audio/mpeg, audio/mp4, audio/ogg, audio/wav, audio/webm

-- ── Verification ─────────────────────────────────────────────────────────────
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'country','state','partner_min_age','partner_max_age','partner_diet',
    'partner_marital_status','partner_location_pref','partner_education_min',
    'partner_notes','voice_intro_url','video_intro_url','pravara',
    'birth_time','birth_place','profile_manager'
  )
ORDER BY column_name;
