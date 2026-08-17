-- ============================================================
-- RLS — stop policies reading auth.users
--
-- Walking the member app as a real signed-in member turned up a 403 on
-- every single read of `collaborators`:
--
--   42501  permission denied for table users
--
-- The policies compare against the caller's email like this:
--
--   collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
--
-- and the `authenticated` role has no SELECT on auth.users, so evaluating
-- the policy errors before it can decide anything. The OR branch that
-- would have matched (`user_id = auth.uid()`) never gets the chance.
--
-- Effect: the whole family-collaboration layer was dead. Kutumba, the
-- collaborator list on edit-profile, and collaborator shortlisting all
-- failed for every member, on every request.
--
-- Postgres helpfully suggests `GRANT SELECT ON auth.users TO authenticated`.
-- Do not do that. It would expose every member's email address, password
-- hash, recovery tokens and confirmation tokens to any signed-in user.
--
-- The fix is to read the email from the caller's own JWT instead. It is
-- already in the token, needs no table access, and cannot be spoofed
-- because the token is signed.
--
-- NOTE ON THE COLUMN NAMES. A first version of this file referenced
-- `shortlists.shortlisted_by`, copied from fix_shortlist_schema.sql. That
-- column does not exist and never did — the whole script failed on it, so
-- nothing was applied. The live table is:
--
--   shortlists     id, user_id, profile_id, added_by_email, note, created_at
--   collaborators  id, user_id, collaborator_email, role, status, created_at
--
-- Everything below is written against those, verified in both databases.
-- It is a reminder that the migrations in this repo do not describe the
-- schema that exists.
--
-- Verify afterwards with: npm run walk
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

-- ── COLLABORATORS ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "collaborators_can_view_own_invites"                   ON public.collaborators;
DROP POLICY IF EXISTS "collaborators_update_own_status"                      ON public.collaborators;
DROP POLICY IF EXISTS "Collaborators can update their own invitation status" ON public.collaborators;

CREATE POLICY "collaborators_can_view_own_invites"
  ON public.collaborators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR collaborator_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "collaborators_update_own_status"
  ON public.collaborators FOR UPDATE
  TO authenticated
  USING (collaborator_email = (auth.jwt() ->> 'email'))
  WITH CHECK (collaborator_email = (auth.jwt() ->> 'email'));

-- ── SHORTLISTS ──────────────────────────────────────────────────────────────
-- Same substitution, real columns only. The `status = 'accepted'` guard is
-- kept: rls_hardening.sql restored it deliberately, because a merely invited
-- collaborator should not be able to shortlist on someone's behalf.

DROP POLICY IF EXISTS "Users can add to shortlists"       ON public.shortlists;
DROP POLICY IF EXISTS "shortlists_insert"                 ON public.shortlists;
DROP POLICY IF EXISTS "Users can delete their shortlists" ON public.shortlists;
DROP POLICY IF EXISTS "shortlists_delete"                 ON public.shortlists;

CREATE POLICY "shortlists_insert"
  ON public.shortlists FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.collaborators c
      WHERE c.collaborator_email = (auth.jwt() ->> 'email')
        AND c.user_id = shortlists.user_id
        AND c.status = 'accepted'
    )
  );

CREATE POLICY "shortlists_delete"
  ON public.shortlists FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR added_by_email = (auth.jwt() ->> 'email')
  );

-- ── NOTIFICATIONS ───────────────────────────────────────────────────────────
--
-- Separate bug, same root cause as the safety tables: fix_notifications_fk.sql
-- pointed actor_id and user_id at auth.users. The notification bell asks
-- PostgREST to embed the actor's profile:
--
--   .select('*, actor:profiles!actor_id(full_name, image_url)')
--
-- which needs a foreign key from notifications.actor_id to profiles. There
-- isn't one, so every request returns PGRST200 and the bell has been silently
-- empty ever since. Repointed at profiles, matching messages, endorsements,
-- profile_photos and the safety tables.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ── Report anything still reading auth.users ────────────────────────────────
-- Should return no rows. Any that appear will 403 for members the same way.
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%')
ORDER BY tablename, policyname;
