-- ============================================================
-- ADD MEMBERSHIP TIER + SUBSCRIPTION FIELDS
--
-- Adds membership_tier to profiles so the dashboard can show
-- "Basic Member", "Gold Member", "Concierge Member" in the
-- user dropdown instead of "ID: PRV-XXX".
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Add membership_tier column (Basic default)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS membership_tier TEXT NOT NULL DEFAULT 'Basic'
  CHECK (membership_tier IN ('Basic', 'Gold', 'Concierge'));

-- 2. Add subscription tracking columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end_date   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_billing    TEXT DEFAULT 'monthly'
  CHECK (subscription_billing IN ('monthly', 'annual'));

-- 3. Ensure all existing rows have 'Basic' (safe, already covered by DEFAULT)
UPDATE profiles SET membership_tier = 'Basic' WHERE membership_tier IS NULL;

-- 4. Verify
SELECT id, full_name, membership_tier FROM profiles LIMIT 10;
