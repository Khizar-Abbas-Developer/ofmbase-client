/*
  # Add Scheduled Posts Table

  1. New Tables
    - `scheduled_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `creator_id` (uuid, references creators)
      - `platform` (text)
      - `scheduled_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  creator_id uuid REFERENCES creators(id),
  platform text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to scheduled_posts"
  ON scheduled_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);