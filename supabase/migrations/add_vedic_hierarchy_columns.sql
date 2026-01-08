-- VEDIC HIERARCHY MIGRATION
-- Adds cultural depth columns for Brahmin matrimonial matching
-- Created: 2026-01-04

-- 1. Add Cultural Depth Columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pravara TEXT,                  -- e.g. "Trayarisheya", "Pancharisheya"
ADD COLUMN IF NOT EXISTS spiritual_org TEXT,            -- e.g. "Sringeri", "Kanchi", "Iskon", "Ahobila Mutt"
ADD COLUMN IF NOT EXISTS religious_level TEXT,          -- e.g. "Orthodox", "Modern", "Spiritual but not Religious"
ADD COLUMN IF NOT EXISTS sub_sect TEXT;                 -- e.g. "Vaidiki Velanadu", "Niyogi", "Iyer - Vadama"

-- 2. Add comments for documentation
COMMENT ON COLUMN public.profiles.pravara IS 'Vedic lineage (e.g., Avatsara-Naidhruva). Linked to Gothra for validation.';
COMMENT ON COLUMN public.profiles.spiritual_org IS 'Family spiritual affiliation (e.g., Sringeri, Kanchi, Ahobila Mutt, Iskon)';
COMMENT ON COLUMN public.profiles.religious_level IS 'Religious observance level (Orthodox, Traditional, Spiritual, Modern)';
COMMENT ON COLUMN public.profiles.sub_sect IS 'Sub-community variant (e.g., Vadama, Vadakalai, Niyogi)';
