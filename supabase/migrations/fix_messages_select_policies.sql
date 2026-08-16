-- ============================================================
-- MESSAGES — nuclear reset of the SELECT policies (SAFE-02)
--
-- The production policy listing showed two SELECT policies on this table:
--
--   Users can read messages in their connections   {public}
--   View messages                                  {public}
--
-- Only the first comes from a migration. "View messages" appears nowhere
-- in this repository, so nobody knows what it permits.
--
-- Behaviour is currently correct — an unrelated member reads nothing, and
-- npm run check:safety asserts it on every run. But duplicate policies on
-- one command are exactly what let the old permissive INSERT policy
-- override the new strict one, silently, for a whole day. The same shape
-- of problem on SELECT would expose private conversations rather than
-- merely allow an unwanted message.
--
-- Both are also granted to `public` rather than `authenticated`, which is
-- broader than anything here needs.
--
-- Same approach as fix_messages_insert_policy.sql: drop every SELECT
-- policy by enumerating pg_policies, then create exactly one.
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
      AND cmd        = 'SELECT'
  LOOP
    RAISE NOTICE 'Dropping SELECT policy on messages: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.messages', policy_name);
  END LOOP;
END $$;

-- Exactly one SELECT policy from here on: you may read a conversation you
-- are a party to, and nothing else.
--
-- Deliberately does NOT consult is_blocked_between. Blocking stops someone
-- reaching you; it does not erase what was already said, and a member should
-- keep the history of a conversation they were part of — not least because
-- they may need it to make a report.
CREATE POLICY "messages_select_own_conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

-- Confirm what survives. Expect one SELECT, one INSERT, one UPDATE, all
-- granted to {authenticated}.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'messages'
ORDER BY cmd, policyname;
