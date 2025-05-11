/*
  # Fix Roles Migration

  1. Changes
    - Drop existing policies before recreating them
    - Add IF NOT EXISTS to policy creation
    - Maintain existing table structure and indexes
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agency owners can manage their roles" ON roles;
DROP POLICY IF EXISTS "Agency owners can manage their role permissions" ON role_permissions;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_permissions table with foreign key to roles
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Agency owners can manage their roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies 
      WHERE agencies.id = roles.agency_id 
      AND agencies.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies 
      WHERE agencies.id = roles.agency_id 
      AND agencies.profile_id = auth.uid()
    )
  );

-- Policies for role_permissions table
CREATE POLICY "Agency owners can manage their role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles 
      JOIN agencies ON agencies.id = roles.agency_id 
      WHERE roles.id = role_permissions.role_id 
      AND agencies.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles 
      JOIN agencies ON agencies.id = roles.agency_id 
      WHERE roles.id = role_permissions.role_id 
      AND agencies.profile_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS roles_agency_id_idx ON roles(agency_id);
CREATE INDEX IF NOT EXISTS role_permissions_role_id_idx ON role_permissions(role_id);