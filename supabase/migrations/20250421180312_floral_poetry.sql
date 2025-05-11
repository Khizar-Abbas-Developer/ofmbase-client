/*
  # Content Requests Schema

  1. New Tables
    - `content_requests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `creator_id` (uuid, references creators)
      - `status` (text) - 'pending' | 'completed' | 'rejected'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create content_requests table
CREATE TABLE IF NOT EXISTS content_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamptz NOT NULL,
  creator_id uuid REFERENCES creators(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to content_requests"
  ON content_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);