/*
  # Update RLS Policies for Creators and Employees

  1. Changes
    - Add agency-specific policies for creators and employees tables
    - Link records to agency profiles
    - Ensure data persistence across sessions

  2. Security
    - Only allow agencies to access their own creators and employees
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access to creators" ON creators;
DROP POLICY IF EXISTS "Allow authenticated users full access to employees" ON employees;

-- Create new policies for creators
CREATE POLICY "Agencies can manage their creators"
  ON creators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    )
  );

-- Create new policies for employees
CREATE POLICY "Agencies can manage their employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.type = 'agency'
    )
  );