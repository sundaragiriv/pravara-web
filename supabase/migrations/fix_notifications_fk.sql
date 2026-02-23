-- ============================================================
-- NOTIFICATIONS — Fix foreign key constraints
--
-- The notifications table was created with user_id/actor_id
-- referencing public.users (which may be empty or non-existent).
-- Pravara uses auth.users (Supabase auth) as the identity source —
-- profile IDs match auth.users.id directly.
--
-- This drops the broken FKs and re-adds them pointing at auth.users.
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Drop existing FK constraints (use the exact names from pg_constraints)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_receiver_id_fkey;

-- Re-add pointing at auth.users
ALTER TABLE notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Verify: should show the new constraints ──────────────────────────────────
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass
ORDER BY conname;
