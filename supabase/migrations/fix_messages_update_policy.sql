-- ============================================================
-- MESSAGES — restore the UPDATE policy
--
-- fix_messages_select_policies.sql ended by listing what survives, with a
-- comment predicting one SELECT, one INSERT and one UPDATE. Only two came
-- back. There is no UPDATE policy on this table in either database.
--
-- rls_hardening.sql creates one — "Receiver can mark messages as read" —
-- with a comment that reads, in full: "Without this, marking messages as
-- read silently fails." That file was evidently never applied here.
--
-- Verified rather than assumed: signing in as the recipient and PATCHing
-- is_read returns 200 with an empty array, and the row stays unread. RLS
-- filters the UPDATE to zero rows and reports success. So unread counts
-- never clear, and a member carries a permanent badge for messages they
-- have already read.
--
-- Written as one policy for the whole command, for the reason this file
-- exists at all: policies are OR'd, and a table with several is a table
-- where nobody can say what is permitted.
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
      AND cmd        = 'UPDATE'
  LOOP
    RAISE NOTICE 'Dropping UPDATE policy on messages: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.messages', policy_name);
  END LOOP;
END $$;

-- Only the recipient, and only to mark it read.
--
-- `sender_id <> auth.uid()` is what keeps this narrow: a sender has no
-- business touching a message once it has left, and without that clause the
-- policy would also let them edit their own messages after the fact — which
-- is not something a matrimony platform should quietly allow.
--
-- Column-level restriction is not expressible in RLS, so WITH CHECK repeats
-- the USING condition; the API only ever sets is_read here.
CREATE POLICY "messages_update_mark_read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  )
  WITH CHECK (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

-- Expect exactly three rows now: one INSERT, one SELECT, one UPDATE, all
-- granted to {authenticated}.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;
