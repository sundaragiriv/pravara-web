-- Create endorsements table for the Varaahi Shield trust system
-- This table stores vouches/endorsements from friends and family

CREATE TABLE IF NOT EXISTS endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endorser_name TEXT NOT NULL,
  relation TEXT NOT NULL, -- Friend, Sibling, Parent, Colleague, Other
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by profile_id
CREATE INDEX IF NOT EXISTS idx_endorsements_profile_id ON endorsements(profile_id);

-- Enable Row Level Security
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read endorsements (public trust verification)
CREATE POLICY "Endorsements are publicly readable"
  ON endorsements FOR SELECT
  USING (true);

-- Policy: Anyone can insert endorsements (friends don't need to be logged in)
CREATE POLICY "Anyone can add endorsements"
  ON endorsements FOR INSERT
  WITH CHECK (true);

-- Policy: Only the profile owner can delete their endorsements
CREATE POLICY "Profile owners can delete their endorsements"
  ON endorsements FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
