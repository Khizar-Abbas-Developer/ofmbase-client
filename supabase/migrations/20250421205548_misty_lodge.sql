/*
  # Fix RLS Policies for Creators and Employees

  1. Changes
    - Drop existing policies
    - Create new policies that properly check user type
    - Add agency-specific access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users full access to creators" ON creators;
DROP POLICY IF EXISTS "Allow authenticated users full access to employees" ON employees;
DROP POLICY IF EXISTS "Agencies can manage their creators" ON creators;
DROP POLICY IF EXISTS "Agencies can manage their employees" ON employees;

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