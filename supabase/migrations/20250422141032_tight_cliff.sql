-- Add agency_id column to creators table
ALTER TABLE creators
ADD COLUMN agency_id uuid REFERENCES agencies(id);

-- Update existing creators to link with agencies
DO $$
DECLARE
  creator_record RECORD;
  agency_id uuid;
BEGIN
  FOR creator_record IN SELECT * FROM creators LOOP
    -- Find the agency for this creator's profile
    SELECT a.id INTO agency_id
    FROM agencies a
    JOIN profiles p ON p.id = a.profile_id
    WHERE p.type = 'agency';
    
    -- Update the creator with the agency_id
    IF agency_id IS NOT NULL THEN
      UPDATE creators
      SET agency_id = agency_id
      WHERE id = creator_record.id;
    END IF;
  END LOOP;
END $$;

-- Update creators policies
DROP POLICY IF EXISTS "Agencies can manage their creators" ON creators;

-- Allow agencies to manage their creators
CREATE POLICY "Agencies can manage their creators"
  ON creators
  FOR ALL
  TO authenticated
  USING (
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    ))
    OR
    (
      -- Creators can view their own data
      id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    )
  );