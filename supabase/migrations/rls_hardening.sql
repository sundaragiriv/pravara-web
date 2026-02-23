-- ============================================================
-- RLS HARDENING MIGRATION — Pravara Matrimony
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Fixes all critical, high, and medium severity RLS gaps identified in audit
-- ============================================================


-- ============================================================
-- 1. PROFILES TABLE (CRITICAL)
-- No RLS policies existed. This is the most sensitive table.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read visible profiles (for match browsing)
-- A user can always read their own profile even if is_visible = false
CREATE POLICY "Authenticated users can read visible profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_visible = true OR id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile row (required for onboarding upsert)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- No DELETE policy = no client-side deletes. Hard deletes are admin-only via service role.


-- ============================================================
-- 2. CONNECTIONS TABLE (CRITICAL)
-- No RLS policies existed. Controls who can contact whom.
-- ============================================================

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can only see connections they are a party to
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can only send requests as themselves
CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Only the receiver can accept or reject a request
CREATE POLICY "Receiver can update connection status"
  ON connections FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Either party can remove a connection
CREATE POLICY "Either party can delete a connection"
  ON connections FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());


-- ============================================================
-- 3. COLLABORATORS TABLE — ADD MISSING UPDATE POLICY (HIGH)
-- Without this, collaborators cannot accept/reject invitations.
-- The kutumba page's accept/reject flow is silently broken.
-- ============================================================

-- A collaborator can update the status of their own invitation (accept/reject)
CREATE POLICY "Collaborators can update their own invitation status"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );


-- ============================================================
-- 4. SHORTLISTS — RESTORE ACCEPTED STATUS GUARD (HIGH)
-- fix_shortlist_schema.sql removed the AND status = 'accepted' check.
-- A pending collaborator should NOT be able to shortlist profiles.
-- ============================================================

DROP POLICY IF EXISTS "Users can add to shortlists" ON shortlists;

CREATE POLICY "Users can add to shortlists"
  ON shortlists FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND user_id = shortlists.user_id
        AND status = 'accepted'  -- Only accepted collaborators can shortlist
    )
  );


-- ============================================================
-- 5. MESSAGES — ADD MISSING UPDATE POLICY (MEDIUM)
-- Without this, marking messages as read silently fails.
-- Unread counts will never clear in production.
-- ============================================================

-- Only the receiver of a message can mark it as read
CREATE POLICY "Receiver can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );


-- ============================================================
-- 6. ENDORSEMENTS — REQUIRE AUTHENTICATION FOR INSERT (MEDIUM)
-- WITH CHECK (true) allows unauthenticated spam.
-- Requiring login prevents bot flooding of the Varaahi Shield.
-- ============================================================

DROP POLICY IF EXISTS "Anyone can add endorsements" ON endorsements;

-- Only authenticated users can add endorsements
-- (The /vouch/[id] page already requires the user to fill a form — login is a small extra step)
CREATE POLICY "Authenticated users can add endorsements"
  ON endorsements FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================
-- VERIFICATION QUERIES
-- Run these after the migration to confirm policies are active
-- ============================================================

-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'connections', 'messages', 'shortlists', 'collaborators', 'endorsements', 'profile_photos')
-- ORDER BY tablename, cmd;
