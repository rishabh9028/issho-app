-- Migration to add pricing breakdown columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS guest_service_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_gst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_commission_from_host DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_gst_on_commission DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS host_payout_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_net_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Update existing bookings (optional, just to avoid nulls if we didn't have defaults)
-- Currently setting them to 0 as we don't know the breakdown of past bookings.
