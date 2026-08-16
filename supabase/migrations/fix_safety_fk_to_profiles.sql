-- ============================================================
-- SAFETY — repoint foreign keys at profiles, not auth.users
--
-- create_safety_tables.sql referenced auth.users(id). Every sibling
-- table in this schema references public.profiles(id) instead —
-- messages.sender_id, endorsements.profile_id, profile_photos.profile_id
-- — so the safety tables were the odd ones out.
--
-- It also made the feature untestable. The 151 seeded dev profiles have
-- no auth.users row, so no block could be created against any of them,
-- and the whole block/report path was unreachable in development.
--
-- Conceptually profiles is the right target anyway: you block a member,
-- not an authentication record.
--
-- Safe to run on a populated database — the tables are new and empty.
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

-- ── BLOCKS ──────────────────────────────────────────────────────────────────

ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_blocker_id_fkey;
ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_blocked_id_fkey;

ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_blocker_id_fkey
  FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_blocked_id_fkey
  FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ── REPORTS ─────────────────────────────────────────────────────────────────

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reported_id_fkey;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_reviewed_by_fkey;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_reporter_id_fkey
  FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_reported_id_fkey
  FOREIGN KEY (reported_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Kept nullable: losing the reviewing admin's account should not erase the
-- record that a decision was made.
ALTER TABLE public.reports
  ADD CONSTRAINT reports_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
