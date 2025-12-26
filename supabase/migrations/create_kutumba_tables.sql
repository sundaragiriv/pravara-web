-- Create collaborators table for the Kutumba Bridge family collaboration system
-- This table stores family members who have restricted access to help with matchmaking

CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collaborator_email TEXT NOT NULL,
  role TEXT NOT NULL, -- Parent, Sibling, Relative
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, collaborator_email)
);

-- Create shortlists table for storing starred profiles
-- Used by both the user and their family collaborators

CREATE TABLE IF NOT EXISTS shortlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shortlisted_by UUID REFERENCES profiles(id), -- NULL if shortlisted by user, otherwise collaborator ID
  note TEXT, -- Internal family notes about this profile
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_email ON collaborators(collaborator_email);
CREATE INDEX IF NOT EXISTS idx_shortlists_user_id ON shortlists(user_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_profile_id ON shortlists(profile_id);

-- Enable Row Level Security
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborators table

-- Users can view their own collaborators
CREATE POLICY "Users can view their own collaborators"
  ON collaborators FOR SELECT
  USING (user_id = auth.uid());

-- Users can invite collaborators
CREATE POLICY "Users can insert their own collaborators"
  ON collaborators FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own collaborators
CREATE POLICY "Users can delete their own collaborators"
  ON collaborators FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for shortlists table

-- Users can view their own shortlists and shortlists made for them by collaborators
CREATE POLICY "Users can view their shortlists"
  ON shortlists FOR SELECT
  USING (
    user_id = auth.uid() OR
    shortlisted_by = auth.uid()
  );

-- Users and their collaborators can insert shortlists
CREATE POLICY "Users can add to shortlists"
  ON shortlists FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND user_id = shortlists.user_id
      AND status = 'accepted'
    )
  );

-- Users can delete their own shortlists
CREATE POLICY "Users can delete their shortlists"
  ON shortlists FOR DELETE
  USING (user_id = auth.uid() OR shortlisted_by = auth.uid());

-- Users can update notes on their shortlists
CREATE POLICY "Users can update their shortlists"
  ON shortlists FOR UPDATE
  USING (user_id = auth.uid() OR shortlisted_by = auth.uid())
  WITH CHECK (user_id = auth.uid() OR shortlisted_by = auth.uid());
