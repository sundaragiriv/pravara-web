-- ============================================================
-- MESSAGES — nuclear reset of the INSERT policy
--
-- create_safety_tables.sql dropped the INSERT policies it knew about by
-- name and created a stricter one. The end-to-end test showed the block
-- was still not holding: a blocked member could message, and anyone could
-- post a message attributed to the other party. Both are precisely the
-- things the new policy adds and the old one lacked.
--
-- The cause is that policies for the same command are OR'd. At least one
-- older permissive INSERT policy is still on this table under a name the
-- DROP list did not match — probably created through the dashboard rather
-- than a migration — so it kept granting what the new one refused.
--
-- Dropping by name cannot fix that, because the name is the thing we do
-- not know. This drops EVERY INSERT policy on public.messages by looking
-- them up in pg_policies, then creates exactly one. Same approach as
-- fix_shortlist_rls_complete.sql, for the same reason.
--
-- Verify afterwards with: npm run check:safety
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

DO $$
DECLARE
  policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'messages'
      AND cmd        = 'INSERT'
  LOOP
    RAISE NOTICE 'Dropping INSERT policy on messages: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.messages', policy_name);
  END LOOP;
END $$;

-- Exactly one INSERT policy from here on.
--
--   sender_id = auth.uid()  — you may only send as yourself. The original
--   policy checked connection membership alone, so either party could post
--   a message attributed to the other.
--
--   status = 'accepted'     — no messaging before a connection is accepted.
--
--   NOT is_blocked_between  — a block holds at the database, not merely in
--   the UI, so it survives a request crafted by hand.
CREATE POLICY "messages_insert_not_blocked"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
        AND c.status = 'accepted'
        AND NOT public.is_blocked_between(c.sender_id, c.receiver_id)
    )
  );

-- Confirm there is now exactly one, and that it is ours.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;
