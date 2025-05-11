/*
  # Fix Existing Agency Records

  1. Changes
    - Create agency records for existing agency profiles
    - Add better error handling and logging
    - Maintain data consistency

  2. Notes
    - Only creates agency records for profiles that don't have one
    - Uses profile email as temporary agency name
*/

DO $$
DECLARE
  profile_record RECORD;
  agency_count INTEGER;
BEGIN
  -- Loop through all agency profiles
  FOR profile_record IN 
    SELECT * FROM profiles 
    WHERE type = 'agency'
  LOOP
    -- Check if agency record exists
    SELECT COUNT(*) INTO agency_count
    FROM agencies
    WHERE profile_id = profile_record.id;

    -- Create agency record if it doesn't exist
    IF agency_count = 0 THEN
      INSERT INTO agencies (
        profile_id,
        name,
        created_at,
        updated_at
      )
      VALUES (
        profile_record.id,
        profile_record.email,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created agency record for profile: %', profile_record.email;
    END IF;
  END LOOP;
END $$;

-- Verify all agency profiles have agencies
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM profiles p
  WHERE p.type = 'agency'
  AND NOT EXISTS (
    SELECT 1 FROM agencies a
    WHERE a.profile_id = p.id
  );

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Found % agency profiles without agency records', missing_count;
  END IF;
END $$;