-- Fix shortlist schema to match application code
-- This migration adds the missing 'added_by_email' column and fixes RLS policies

-- Add the missing column
ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS added_by_email TEXT;

-- Update existing RLS policy to allow collaborators to insert using email check
DROP POLICY IF EXISTS "Users can add to shortlists" ON shortlists;

CREATE POLICY "Users can add to shortlists"
  ON shortlists FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND user_id = shortlists.user_id
    )
  );

-- Fix delete policy to also check added_by_email
DROP POLICY IF EXISTS "Users can delete their shortlists" ON shortlists;

CREATE POLICY "Users can delete their shortlists"
  ON shortlists FOR DELETE
  USING (
    user_id = auth.uid() OR 
    shortlisted_by = auth.uid() OR
    added_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
