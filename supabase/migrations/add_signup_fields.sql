-- ============================================================
-- Add signup fields: phone, profile_created_for, gender (if missing)
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Phone number (mandatory at signup)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Who the profile was created for (Self / Son / Daughter / Brother / Sister / Relative/Friend)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_created_for TEXT DEFAULT 'Self';

-- Gender (may already exist from onboarding — IF NOT EXISTS is safe)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- ── Verify ───────────────────────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('phone', 'profile_created_for', 'gender')
ORDER BY column_name;
