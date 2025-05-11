/*
  # Update Creators Table Schema

  1. Changes
    - Add address JSONB column
    - Add measurements JSONB column

  2. Notes
    - Using JSONB for flexible storage of address and measurements data
    - Maintains existing data
*/

-- Add new columns to creators table
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS measurements JSONB;

-- Update existing rows with default values
UPDATE creators 
SET 
  address = '{}',
  measurements = '{}'
WHERE address IS NULL OR measurements IS NULL;