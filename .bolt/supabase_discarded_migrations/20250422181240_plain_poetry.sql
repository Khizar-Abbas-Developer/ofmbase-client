/*
  # Create Role Management Tables

  1. New Tables
    - `agencies`
      - `id` (uuid, primary key)
      - `profile_id` (uuid)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `roles`
      - `id` (uuid, primary key)
      - `agency_id` (uuid, references agencies)
      - `name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `role_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid, references roles)
      - `permission` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add role_id to employees table
    - Enable RLS on new tables
    - Add agency-specific policies
*/

-- Create agencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission)
);

-- Create employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  hourly_rate numeric NOT NULL,
  payment_schedule text NOT NULL,
  payment_method text NOT NULL,
  paypal_email text,
  status text NOT NULL DEFAULT 'invited',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add role_id to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES roles(id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agency owners can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agencies a
      JOIN profiles p ON p.id = a.profile_id
      WHERE a.id = roles.agency_id
      AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agencies a
      JOIN profiles p ON p.id = a.profile_id
      WHERE a.id = roles.agency_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Agency owners can manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      JOIN agencies a ON a.id = r.agency_id
      JOIN profiles p ON p.id = a.profile_id
      WHERE r.id = role_permissions.role_id
      AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles r
      JOIN agencies a ON a.id = r.agency_id
      JOIN profiles p ON p.id = a.profile_id
      WHERE r.id = role_permissions.role_id
      AND p.id = auth.uid()
    )
  );