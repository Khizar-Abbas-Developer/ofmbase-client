/*
  # Fix costume requests table schema
  
  1. Changes
    - Create costume_requests table if not exists
    - Add proper column types and constraints
    - Enable RLS if not already enabled
    - Drop existing policy if exists before creating new one
*/

-- Create costume_requests table
CREATE TABLE IF NOT EXISTS costume_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subname text NOT NULL,
  creator_id uuid REFERENCES creators(id),
  costume_number text NOT NULL,
  video_type text,
  video_length text,
  sub_request text,
  outfit_description text,
  payment numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'costume_requests'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE costume_requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow authenticated users full access to costume_requests" ON costume_requests;

-- Create policy
CREATE POLICY "Allow authenticated users full access to costume_requests"
  ON costume_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);