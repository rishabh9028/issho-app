-- RUN THIS IN SUPABASE SQL EDITOR
-- 1. Adds 'availability' column to 'spaces'
-- 2. Sets up RLS for 'bookings' so guests can book and hosts can manage requests

-- Add availability column
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
  "monday": {"open": true, "start": "09:00 AM", "end": "05:00 PM"},
  "tuesday": {"open": true, "start": "09:00 AM", "end": "05:00 PM"},
  "wednesday": {"open": true, "start": "09:00 AM", "end": "05:00 PM"},
  "thursday": {"open": true, "start": "09:00 AM", "end": "05:00 PM"},
  "friday": {"open": true, "start": "09:00 AM", "end": "05:00 PM"},
  "saturday": {"open": false, "start": "10:00 AM", "end": "04:00 PM"},
  "sunday": {"open": false, "start": "10:00 AM", "end": "04:00 PM"}
}'::jsonb;

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Guests can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their spaces" ON bookings;
DROP POLICY IF EXISTS "Hosts can update bookings for their spaces" ON bookings;

-- Policies for bookings
CREATE POLICY "Guests can create bookings" ON bookings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings" ON bookings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view bookings for their spaces" ON bookings 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaces 
      WHERE spaces.id = bookings.space_id 
      AND spaces.host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update bookings for their spaces" ON bookings 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM spaces 
      WHERE spaces.id = bookings.space_id 
      AND spaces.host_id = auth.uid()
    )
  );
-- 3. Enable Realtime for 'bookings'
-- This allows guests and hosts to see status changes immediately
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add table to publication if not already present
  -- This is idempotent (will not error if already added)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;
END $$;
