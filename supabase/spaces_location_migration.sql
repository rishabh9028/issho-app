-- Migration to add coordinates to spaces table
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS lng NUMERIC;
