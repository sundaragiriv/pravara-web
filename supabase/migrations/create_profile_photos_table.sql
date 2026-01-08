-- Create profile_photos table for gallery images
-- This table stores additional photos that users can add to showcase their life and moments

CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by profile_id
CREATE INDEX IF NOT EXISTS idx_profile_photos_profile_id ON profile_photos(profile_id);

-- Enable Row Level Security
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own photos and photos of profiles they can see
CREATE POLICY "Users can view profile photos"
  ON profile_photos FOR SELECT
  USING (true); -- Photos are public (visible on public profiles)

-- Policy: Users can only add photos to their own profile
CREATE POLICY "Users can add photos to their own profile"
  ON profile_photos FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can only delete their own photos
CREATE POLICY "Users can delete their own photos"
  ON profile_photos FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
