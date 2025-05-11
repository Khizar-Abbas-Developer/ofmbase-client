/*
  # Add outfit description column to costume requests

  1. Changes
    - Add `outfit_description` column to `costume_requests` table
    - Column is nullable since it's an optional field in the form
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'costume_requests' 
    AND column_name = 'outfitdescription'
  ) THEN
    ALTER TABLE costume_requests ADD COLUMN outfitdescription text;
  END IF;
END $$;