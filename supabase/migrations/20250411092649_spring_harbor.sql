/*
  # Update handle_new_user trigger function

  1. Changes
    - Add detailed error handling
    - Add logging for debugging
    - Add transaction handling
    - Add input validation

  2. Notes
    - Logs user ID and email for debugging
    - Validates input data before insertion
    - Provides detailed error messages
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the incoming data
  RAISE LOG 'handle_new_user() called with user_id: %, email: %', NEW.id, NEW.email;

  -- Validate input data
  IF NEW.id IS NULL THEN
    RAISE LOG 'Error: user_id is null';
    RETURN NULL;
  END IF;

  IF NEW.email IS NULL THEN
    RAISE LOG 'Error: email is null';
    RETURN NULL;
  END IF;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE LOG 'Profile already exists for user_id: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Insert new profile
  BEGIN
    INSERT INTO public.profiles (id, email, type)
    VALUES (NEW.id, NEW.email, 'agency');

    RAISE LOG 'Successfully created profile for user_id: %, email: %', NEW.id, NEW.email;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE LOG 'Error creating profile: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RETURN NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;