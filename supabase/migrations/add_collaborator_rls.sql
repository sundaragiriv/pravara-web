-- ============================================================
-- Pravara — Collaborator RLS Policies
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Allow collaborators to see invites addressed to their email
DROP POLICY IF EXISTS "collaborators_can_view_own_invites" ON collaborators;
CREATE POLICY "collaborators_can_view_own_invites"
  ON collaborators FOR SELECT TO authenticated
  USING (
    collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

-- Allow profile owners to insert collaborators for themselves
DROP POLICY IF EXISTS "collaborators_owner_insert" ON collaborators;
CREATE POLICY "collaborators_owner_insert"
  ON collaborators FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow profile owners to delete their own collaborators
DROP POLICY IF EXISTS "collaborators_owner_delete" ON collaborators;
CREATE POLICY "collaborators_owner_delete"
  ON collaborators FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Allow collaborators to update their own invite status (accept/decline)
DROP POLICY IF EXISTS "collaborators_update_own_status" ON collaborators;
CREATE POLICY "collaborators_update_own_status"
  ON collaborators FOR UPDATE TO authenticated
  USING (collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin full access
DROP POLICY IF EXISTS "collaborators_admin_all" ON collaborators;
CREATE POLICY "collaborators_admin_all"
  ON collaborators FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
