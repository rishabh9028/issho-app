-- Add booking_id to reviews table and restrict to one review per booking
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);
ALTER TABLE reviews ADD CONSTRAINT unique_booking_review UNIQUE (booking_id);

-- Enable RLS for insertions
-- Note: 'reviews' table might already have policies, we ensure users can only review their own bookings
CREATE POLICY "Users can insert reviews for their own finished bookings"
ON reviews FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_id 
        AND user_id = auth.uid() 
        AND status = 'confirmed'
    )
);
