-- Add metadata column to bookings table to store flexible JSON data like pricing labels, refundable status, and guest counts
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
