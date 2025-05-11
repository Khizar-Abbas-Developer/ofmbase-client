/*
  # Add Tasks Table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `assigned_to` (uuid, references employees)
      - `due_date` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to uuid REFERENCES employees(id),
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);