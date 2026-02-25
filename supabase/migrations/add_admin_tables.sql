-- ============================================================
-- Pravara — Admin Foundation
-- Adds: is_admin flag on profiles, coupons table
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================

-- ── 1. is_admin flag on profiles ─────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- ── 2. Coupons table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  discount_pct  SMALLINT NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  max_uses      INT NOT NULL DEFAULT 1,
  used_count    INT NOT NULL DEFAULT 0,
  valid_from    TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until   TIMESTAMPTZ,                        -- NULL = no expiry
  tier_target   TEXT CHECK (tier_target IN ('Gold','Concierge',NULL)),  -- NULL = any
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes         TEXT
);

-- Index for fast coupon lookups by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code) WHERE is_active = true;

-- ── 3. RLS on coupons ────────────────────────────────────────
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active coupons (to validate at checkout)
CREATE POLICY IF NOT EXISTS "coupons_read_active"
  ON coupons FOR SELECT TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Only admins can manage coupons
CREATE POLICY IF NOT EXISTS "coupons_admin_all"
  ON coupons FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 4. coupon_redemptions (audit trail) ──────────────────────
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)   -- one redemption per user per coupon
);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "redemptions_admin_read"
  ON coupon_redemptions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ── 5. Verify ────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_admin';

SELECT COUNT(*) AS coupon_table_rows FROM coupons;
