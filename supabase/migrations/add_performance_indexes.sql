-- Performance indexes for Pravara matrimony platform
-- Run this migration to speed up common search queries

-- 1. Index for Sutradhar search_matches queries (profession, gothra, age)
CREATE INDEX IF NOT EXISTS idx_profiles_profession ON profiles USING gin (profession gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_gothra ON profiles USING gin (gothra gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles (age);

-- 2. Index for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING gin (location gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_community ON profiles USING gin (sub_community gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_diet ON profiles (diet);
CREATE INDEX IF NOT EXISTS idx_profiles_visa_status ON profiles (visa_status);

-- 3. Index for visibility filtering (most queries filter on this)
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible ON profiles (is_visible) WHERE is_visible = true;

-- 4. Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_profiles_gender_age ON profiles (gender, age) WHERE is_visible = true;

-- 5. Index for connections queries (used heavily in chat and requests)
CREATE INDEX IF NOT EXISTS idx_connections_sender ON connections (sender_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections (receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections (status);

-- 6. Index for messages (chat performance)
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages (connection_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (connection_id, sender_id, is_read) WHERE is_read = false;

-- 7. Index for shortlist queries
CREATE INDEX IF NOT EXISTS idx_shortlists_user ON shortlists (user_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_profile ON shortlists (profile_id);

-- Note: The gin_trgm_ops indexes require the pg_trgm extension for ILIKE queries
-- Run this first if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
