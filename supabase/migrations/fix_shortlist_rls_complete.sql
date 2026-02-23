-- ============================================================
-- SHORTLISTS — Nuclear policy reset
-- Drops EVERY existing policy (old + new) then rebuilds cleanly.
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS added_by_email TEXT;

-- ── Drop EVERY policy by exact name (from pg_policies audit) ────────────────
DROP POLICY IF EXISTS "Safe Modify Shortlist"                   ON shortlists;
DROP POLICY IF EXISTS "Users can delete own shortlist"          ON shortlists;
DROP POLICY IF EXISTS "Users can delete their own shortlist"    ON shortlists;
DROP POLICY IF EXISTS "Users can delete their shortlists"       ON shortlists;
DROP POLICY IF EXISTS "shortlists_delete"                       ON shortlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users"   ON shortlists;
DROP POLICY IF EXISTS "Users can create own shortlist"          ON shortlists;
DROP POLICY IF EXISTS "Users can insert their own shortlist"    ON shortlists;
DROP POLICY IF EXISTS "Users can add to shortlists"             ON shortlists;
DROP POLICY IF EXISTS "shortlists_insert"                       ON shortlists;
DROP POLICY IF EXISTS "Users can view their own shortlist"      ON shortlists;
DROP POLICY IF EXISTS "Users can view their shortlists"         ON shortlists;
DROP POLICY IF EXISTS "Users can view their own shortlists"     ON shortlists;
DROP POLICY IF EXISTS "Safe View Shortlist"                     ON shortlists;
DROP POLICY IF EXISTS "shortlists_select"                       ON shortlists;
DROP POLICY IF EXISTS "Users can view own or family shortlists" ON shortlists;
DROP POLICY IF EXISTS "shortlists_update"                       ON shortlists;
DROP POLICY IF EXISTS "Users can update their shortlists"       ON shortlists;

-- ── Rebuild: exactly 4 clean policies ───────────────────────────────────────

-- SELECT: user sees their own rows
CREATE POLICY "shortlists_select"
  ON shortlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: user adds for themselves, or an accepted collaborator adds on their behalf
CREATE POLICY "shortlists_insert"
  ON shortlists FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborators c
      WHERE c.collaborator_email = auth.email()
        AND c.user_id            = shortlists.user_id
        AND c.status             = 'accepted'
    )
  );

-- DELETE: user removes their own, or the collaborator who added it removes it
CREATE POLICY "shortlists_delete"
  ON shortlists FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR added_by_email = auth.email()
  );

-- UPDATE: user edits notes on their own entries only
CREATE POLICY "shortlists_update"
  ON shortlists FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Verify: should return exactly 4 rows after running ──────────────────────
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'shortlists'
ORDER BY cmd;
