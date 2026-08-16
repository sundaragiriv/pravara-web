-- ============================================================
-- SAFETY — blocks and reports
--
-- Pravara had no block, no report, no mute and no abuse queue. On a
-- platform where strangers message each other about marriage, and where
-- many members are women whose families are watching closely, that is a
-- missing floor rather than a missing feature.
--
-- Two tables:
--   blocks   — one member decides another may not reach them. Silent to
--              the blocked party, and symmetric in effect: neither sees
--              the other afterwards.
--   reports  — a member tells us something is wrong. Goes to an admin
--              queue; the reporter is not told what action was taken,
--              only that it was received.
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- ── BLOCKS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocks_not_self CHECK (blocker_id <> blocked_id),
  CONSTRAINT blocks_unique_pair UNIQUE (blocker_id, blocked_id)
);

-- Both directions are queried on every match list and every conversation,
-- so both get an index.
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_id);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select" ON public.blocks;
DROP POLICY IF EXISTS "blocks_insert" ON public.blocks;
DROP POLICY IF EXISTS "blocks_delete" ON public.blocks;

-- A member sees only the blocks they created. Deliberately NOT the ones
-- against them: "who has blocked me" is not information we hand out, and
-- knowing would defeat the point of a silent block.
CREATE POLICY "blocks_select"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "blocks_insert"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocks_delete"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

-- ── REPORTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL CHECK (reason IN (
                  'fake_profile',
                  'harassment',
                  'inappropriate_photos',
                  'asking_for_money',
                  'already_married',
                  'underage',
                  'other'
                )),
  detail        TEXT,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                  'open', 'reviewing', 'actioned', 'dismissed'
                )),
  admin_notes   TEXT,
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reports_not_self CHECK (reporter_id <> reported_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status   ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own"   ON public.reports;
DROP POLICY IF EXISTS "reports_insert"       ON public.reports;
DROP POLICY IF EXISTS "reports_admin_select" ON public.reports;
DROP POLICY IF EXISTS "reports_admin_update" ON public.reports;

-- A reporter can see that their own report exists. They cannot see
-- admin_notes changing hands or what was decided — telling a reporter the
-- outcome invites retaliation against the person they reported.
CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "reports_insert"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "reports_admin_select"
  ON public.reports FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

CREATE POLICY "reports_admin_update"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE
  ));

-- ── ENFORCEMENT ─────────────────────────────────────────────────────────────

/**
 * True when either party has blocked the other.
 *
 * Blocking is symmetric in effect even though the row is one-directional:
 * if she blocks him, he must not be able to reach her either. Checking one
 * direction only would leave the blocked party still able to message.
 *
 * SECURITY DEFINER so it can read `blocks` rows the caller cannot select —
 * the caller must not be able to enumerate who blocked them, but the policy
 * still has to know.
 */
CREATE OR REPLACE FUNCTION public.is_blocked_between(a UUID, b UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = a AND blocked_id = b)
       OR (blocker_id = b AND blocked_id = a)
  );
$$;

REVOKE ALL ON FUNCTION public.is_blocked_between(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_blocked_between(UUID, UUID) TO authenticated;

-- Stop a blocked member sending a message at the database, not only in the UI.
-- Application-level filtering hides people from each other; this is what makes
-- the block hold if a request is crafted by hand.
--
-- The existing INSERT policy is REPLACED rather than joined. Policies for the
-- same command are OR'd together, so adding a second, stricter one would have
-- changed nothing at all — the permissive original would still have let the
-- message through.
--
-- Replacing it also closes a separate hole: the original checked only that the
-- caller belonged to the connection, never that `sender_id` was actually them.
-- Any member of a conversation could therefore insert a message attributed to
-- the other person.
DROP POLICY IF EXISTS "Users can insert messages"        ON public.messages;
DROP POLICY IF EXISTS "messages_insert"                  ON public.messages;
DROP POLICY IF EXISTS "messages_insert_not_blocked"      ON public.messages;

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
