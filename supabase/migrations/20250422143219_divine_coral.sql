/*
  # Add Foreign Key Constraint for Creators

  1. Changes
    - Add NOT NULL constraint to agency_id
    - Add foreign key constraint to ensure creators belong to an agency
*/

-- Make agency_id required for creators
ALTER TABLE creators
ALTER COLUMN agency_id SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'creators_agency_id_fkey'
  ) THEN
    ALTER TABLE creators
    ADD CONSTRAINT creators_agency_id_fkey 
    FOREIGN KEY (agency_id) 
    REFERENCES agencies(id);
  END IF;
END $$;