-- RUN THIS IN SUPABASE SQL EDITOR
-- Create guest_reviews table

CREATE TABLE IF NOT EXISTS guest_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(booking_id) -- One review per booking
);

-- Enable RLS
ALTER TABLE guest_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Hosts can insert reviews for their own bookings" ON guest_reviews
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Everyone can read guest reviews" ON guest_reviews
  FOR SELECT USING (true);

-- Update Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'guest_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guest_reviews;
  END IF;
END $$;
