-- ============================================================
-- REFERENCE — the languages that were missing
--
-- ref_languages held seven rows, so a Malayalam, Bengali, Gujarati,
-- Odia, Punjabi, Konkani, Tulu, Assamese or Kashmiri family could not get
-- past the first step of the community picker: their language simply was
-- not there.
--
-- Languages only. No communities are being added, and that is deliberate:
-- naming a language is not a claim about anyone's caste, so it is safe,
-- while naming a community is — and those wait for family validation of
-- the regional research. Until then the picker offers "Other, let me type
-- it" at step two, which is the honest answer.
--
-- Ids match utils/community-data.ts and are stable because profiles
-- reference them. 6 (Sanskrit) and 7 (Other) keep their existing ids;
-- ordering in the UI comes from the array in that file, not from here.
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

INSERT INTO public.ref_languages (id, name) VALUES
  (8,  'Malayalam'),
  (9,  'Bengali'),
  (10, 'Gujarati'),
  (11, 'Odia'),
  (12, 'Punjabi'),
  (13, 'Konkani'),
  (14, 'Tulu'),
  (15, 'Assamese'),
  (16, 'Kashmiri')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Keep any sequence in step with the explicit ids above, so a later insert
-- without an id does not collide.
SELECT setval(
  pg_get_serial_sequence('public.ref_languages', 'id'),
  GREATEST((SELECT MAX(id) FROM public.ref_languages), 1)
)
WHERE pg_get_serial_sequence('public.ref_languages', 'id') IS NOT NULL;

SELECT id, name FROM public.ref_languages ORDER BY id;
