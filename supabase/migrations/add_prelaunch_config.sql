-- ============================================================
-- Pravara — Pre-Registration Config Keys
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

INSERT INTO site_config (key, value, description) VALUES
  ('pre_registration_mode', 'true', 'When true, locks dashboard behind pre-launch countdown page'),
  ('launch_date', '2026-04-23', 'Full app goes live on this date')
ON CONFLICT (key) DO NOTHING;
