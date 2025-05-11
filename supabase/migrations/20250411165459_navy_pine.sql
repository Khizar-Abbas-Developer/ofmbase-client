/*
  # Update Profile Types Migration

  This migration updates the profile types for test users.

  1. Changes
    - Add function to safely update profile types
    - Add procedure to update test user profile types
    - Set explicit search_path for security
*/

-- Create a function to safely update profile type
CREATE OR REPLACE FUNCTION update_profile_type(p_email text, p_type text)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET type = p_type
  WHERE email = p_email
  AND EXISTS (
    SELECT 1 FROM auth.users WHERE email = p_email
  );
END;
$$;

-- Create a procedure to update test user profile types
DO $$ 
BEGIN
  -- Update profile types for test users
  PERFORM update_profile_type('test.creator@example.com', 'creator');
  PERFORM update_profile_type('test.employee@example.com', 'employee');
END $$;