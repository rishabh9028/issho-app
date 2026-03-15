-- Migration to add pet friendly column to spaces table
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE;
