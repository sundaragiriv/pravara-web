-- ============================================================
-- Pravara -- Phase 2: Add FK columns to profiles
-- Replaces free-text cultural fields with controlled FK references.
-- Also adds partner preference columns and geographic context.
--
-- Run AFTER: seed_ref_tables.sql
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- ============================================================

-- ── 1. Community Hierarchy FKs ────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language_id        INT REFERENCES ref_languages(id),
  ADD COLUMN IF NOT EXISTS community_id       INT REFERENCES ref_communities(id),
  ADD COLUMN IF NOT EXISTS sub_community_id   INT REFERENCES ref_sub_communities(id);

-- ── 2. Vedic Attribute FKs ────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nakshatra_id       INT REFERENCES ref_nakshatras(id),
  ADD COLUMN IF NOT EXISTS raasi_id           INT REFERENCES ref_raasis(id),
  ADD COLUMN IF NOT EXISTS gothra_id          INT REFERENCES ref_gothras(id);

-- Re-type nakshatra_padam to SMALLINT with constraint (was TEXT)
-- Step 1: add new column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nakshatra_padam_num SMALLINT CHECK (nakshatra_padam_num BETWEEN 1 AND 4);

-- ── 3. Geographic Context ─────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_city         TEXT,
  ADD COLUMN IF NOT EXISTS current_state        TEXT,
  ADD COLUMN IF NOT EXISTS family_origin_state  TEXT,
  ADD COLUMN IF NOT EXISTS language_at_home_id  INT REFERENCES ref_languages(id);

-- ── 4. Partner Preferences ────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_min_age          SMALLINT,
  ADD COLUMN IF NOT EXISTS partner_max_age          SMALLINT,
  ADD COLUMN IF NOT EXISTS partner_language_id      INT REFERENCES ref_languages(id),
  ADD COLUMN IF NOT EXISTS partner_community_id     INT REFERENCES ref_communities(id),
  ADD COLUMN IF NOT EXISTS partner_diet             TEXT,
  ADD COLUMN IF NOT EXISTS partner_marital_status   TEXT,
  ADD COLUMN IF NOT EXISTS partner_location_pref    TEXT,
  ADD COLUMN IF NOT EXISTS partner_education_min    TEXT;

-- ── 5. Performance Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_language_id      ON public.profiles(language_id);
CREATE INDEX IF NOT EXISTS idx_profiles_community_id     ON public.profiles(community_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nakshatra_id     ON public.profiles(nakshatra_id);
CREATE INDEX IF NOT EXISTS idx_profiles_raasi_id         ON public.profiles(raasi_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gothra_id        ON public.profiles(gothra_id);

-- ── 6. Column Comments ────────────────────────────────────────────────────
COMMENT ON COLUMN public.profiles.language_id       IS 'FK → ref_languages. Language spoken at home (top of community hierarchy)';
COMMENT ON COLUMN public.profiles.community_id      IS 'FK → ref_communities. Jati/Sampradaya (e.g., Niyogi, Iyer, Madhwa)';
COMMENT ON COLUMN public.profiles.sub_community_id  IS 'FK → ref_sub_communities. Regional variant (e.g., Vadama, Velanadu)';
COMMENT ON COLUMN public.profiles.nakshatra_id      IS 'FK → ref_nakshatras. Birth star — drives 6 of 8 Ashtakoot Kuta scores';
COMMENT ON COLUMN public.profiles.raasi_id          IS 'FK → ref_raasis. Moon sign — auto-derived from nakshatra if not set';
COMMENT ON COLUMN public.profiles.gothra_id         IS 'FK → ref_gothras. Vedic lineage — Sagothra check (dealbreaker)';
COMMENT ON COLUMN public.profiles.nakshatra_padam_num IS 'Nakshatra quarter/Pada (1–4) for Navamsa chart';
COMMENT ON COLUMN public.profiles.partner_min_age   IS 'Preferred minimum age of partner';
COMMENT ON COLUMN public.profiles.partner_max_age   IS 'Preferred maximum age of partner';
COMMENT ON COLUMN public.profiles.partner_language_id IS 'Preferred language background of partner';
COMMENT ON COLUMN public.profiles.partner_community_id IS 'Preferred community of partner (NULL = open)';


-- ── 7. Optional: match_guna_scores cache ──────────────────────────────────
-- Stores pre-computed Ashtakoot scores so the dashboard doesn't recompute
-- every page load. Computed by matchEngine, invalidated when profiles change.

CREATE TABLE IF NOT EXISTS match_guna_scores (
  profile_a_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_b_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  varna_score       SMALLINT,
  vashya_score      SMALLINT,
  tara_score        SMALLINT,
  yoni_score        SMALLINT,
  graha_score       SMALLINT,
  gana_score        SMALLINT,
  bhakoot_score     SMALLINT,
  nadi_score        SMALLINT,
  total_score       SMALLINT,   -- /36
  has_nadi_dosha    BOOLEAN DEFAULT FALSE,
  has_bhakoot_dosha BOOLEAN DEFAULT FALSE,
  has_gana_dosha    BOOLEAN DEFAULT FALSE,
  sagothra          BOOLEAN DEFAULT FALSE,
  computed_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_a_id, profile_b_id)
);

CREATE INDEX IF NOT EXISTS idx_guna_scores_a ON match_guna_scores(profile_a_id);
CREATE INDEX IF NOT EXISTS idx_guna_scores_b ON match_guna_scores(profile_b_id);

-- RLS: users can only read scores where they are profile_a
ALTER TABLE match_guna_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_read_own_guna_scores"
  ON match_guna_scores FOR SELECT
  USING (profile_a_id = auth.uid() OR profile_b_id = auth.uid());

CREATE POLICY IF NOT EXISTS "service_role_manage_guna_scores"
  ON match_guna_scores FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);


-- ── 8. Verify ─────────────────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'language_id','community_id','sub_community_id',
    'nakshatra_id','raasi_id','gothra_id','nakshatra_padam_num',
    'current_city','current_state','family_origin_state',
    'partner_min_age','partner_max_age','partner_language_id',
    'partner_community_id','partner_diet','partner_marital_status',
    'partner_location_pref','partner_education_min'
  )
ORDER BY column_name;
