/*
  # Fix User Creation Process

  1. Changes
    - Update handle_new_user trigger to create both profile and agency
    - Add better error handling
    - Ensure atomic operations
    - Add logging for debugging

  2. Notes
    - Creates profile and agency in a single transaction
    - Maintains data consistency
    - Improves error handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _now timestamp with time zone := now();
  _agency_id uuid;
BEGIN
  -- Log the incoming data
  RAISE LOG 'handle_new_user() called with user_id: %, email: %', NEW.id, NEW.email;

  -- Validate input data
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;

  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'email cannot be null';
  END IF;

  -- Start transaction
  BEGIN
    -- Create profile
    INSERT INTO public.profiles (
      id,
      email,
      type,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'agency',
      _now,
      _now
    );

    -- Create agency record
    INSERT INTO public.agencies (
      profile_id,
      name,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email, -- Use email as temporary name
      _now,
      _now
    )
    RETURNING id INTO _agency_id;

    RAISE LOG 'Successfully created profile and agency for user_id: %, email: %, agency_id: %', 
      NEW.id, NEW.email, _agency_id;

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE LOG 'Error in handle_new_user(): %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RAISE EXCEPTION 'Failed to create user profile and agency: %', SQLERRM;
  END;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;