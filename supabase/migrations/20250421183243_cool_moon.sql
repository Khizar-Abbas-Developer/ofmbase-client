/*
  # Add Credentials Tables

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key)
      - `platform` (text)
      - `username` (text)
      - `password` (text)
      - `notes` (text)
      - `type` (text) - 'agency' | 'creator'
      - `creator_id` (uuid, references creators)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  notes text,
  type text NOT NULL CHECK (type IN ('agency', 'creator')),
  creator_id uuid REFERENCES creators(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to credentials"
  ON credentials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);