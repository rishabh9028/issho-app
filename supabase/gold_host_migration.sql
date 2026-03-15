-- Migration to add Gold Host status to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_gold_host BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gold_host_expires_at TIMESTAMP WITH TIME ZONE;

-- Add a comment for clarity
COMMENT ON COLUMN profiles.is_gold_host IS 'Indicates if the host has a premium Gold status';
COMMENT ON COLUMN profiles.gold_host_expires_at IS 'The expiration date of the Gold Host subscription';
