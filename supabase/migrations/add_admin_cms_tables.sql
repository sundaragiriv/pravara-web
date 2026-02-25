-- ============================================================
-- Pravara — Admin CMS Tables
-- membership_plans, site_config, coupons (fixed RLS)
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── 1. membership_plans  (CMS for tier definitions) ──────────
CREATE TABLE IF NOT EXISTS membership_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                  TEXT NOT NULL UNIQUE CHECK (tier IN ('Basic','Gold','Concierge')),
  price_monthly         NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_annual          NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_daily_invitations INT  NOT NULL DEFAULT 5,
  bhrugu_engine         BOOLEAN NOT NULL DEFAULT false,
  photo_limit           INT  NOT NULL DEFAULT 3,
  contact_reveal        BOOLEAN NOT NULL DEFAULT false,
  priority_matching     BOOLEAN NOT NULL DEFAULT false,
  shortlist_limit       INT  NOT NULL DEFAULT 20,
  features              JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO membership_plans
  (tier, price_monthly, price_annual, max_daily_invitations, bhrugu_engine,
   photo_limit, contact_reveal, priority_matching, shortlist_limit, features)
VALUES
  ('Basic', 0, 0, 5, false, 3, false, false, 20,
   '["Browse profiles","5 invitations/day","Basic Ashtakoot score","3 photos"]'::jsonb),
  ('Gold', 29, 249, 25, true, 10, true, false, 100,
   '["Everything in Basic","25 invitations/day","Bhrugu Engine unlocked","10 photos","Contact reveal","100 shortlists"]'::jsonb),
  ('Concierge', 79, 699, 999, true, 50, true, true, 999,
   '["Everything in Gold","Unlimited invitations","Priority matching","Dedicated matchmaker","Verified badge","Unlimited photos"]'::jsonb)
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_public_read"  ON membership_plans;
DROP POLICY IF EXISTS "plans_admin_write"  ON membership_plans;

CREATE POLICY "plans_public_read"
  ON membership_plans FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "plans_admin_write"
  ON membership_plans FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ── 2. site_config  (feature flags & announcements) ──────────
CREATE TABLE IF NOT EXISTS site_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO site_config (key, value, description) VALUES
  ('maintenance_mode',      'false', 'Set to true to show maintenance page to all users'),
  ('new_registrations',     'true',  'Allow new users to sign up'),
  ('announcement_text',     '',      'Global banner text shown on dashboard (empty = hidden)'),
  ('announcement_type',     'info',  'Banner style: info | warning | success | error'),
  ('min_profile_age',       '18',    'Minimum age allowed at signup'),
  ('max_profile_age',       '60',    'Maximum age shown in search filters'),
  ('default_match_radius',  '500',   'Default location radius (km) for match engine'),
  ('bhrugu_min_score',      '18',    'Minimum Ashtakoot score to show Bhrugu result'),
  ('support_email',         'support@pravara.in', 'Support email shown on site')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_admin_all"   ON site_config;
DROP POLICY IF EXISTS "config_public_read" ON site_config;

CREATE POLICY "config_public_read"
  ON site_config FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "config_admin_all"
  ON site_config FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ── 3. coupons (recreate with correct RLS — no IF NOT EXISTS on POLICY) ──
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  discount_pct SMALLINT NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  max_uses     INT NOT NULL DEFAULT 1,
  used_count   INT NOT NULL DEFAULT 0,
  valid_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until  TIMESTAMPTZ,
  tier_target  TEXT CHECK (tier_target IN ('Gold','Concierge') OR tier_target IS NULL),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes        TEXT
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_read_active" ON coupons;
DROP POLICY IF EXISTS "coupons_admin_all"   ON coupons;

CREATE POLICY "coupons_read_active"
  ON coupons FOR SELECT TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "coupons_admin_all"
  ON coupons FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code) WHERE is_active = true;


-- ── 4. coupon_redemptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions_admin_read" ON coupon_redemptions;

CREATE POLICY "redemptions_admin_read"
  ON coupon_redemptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ── 5. Verify ─────────────────────────────────────────────────
SELECT 'membership_plans' AS tbl, COUNT(*) FROM membership_plans
UNION ALL SELECT 'site_config', COUNT(*) FROM site_config
UNION ALL SELECT 'coupons',     COUNT(*) FROM coupons;
