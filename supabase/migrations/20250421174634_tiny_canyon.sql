/*
  # Time Entries Schema

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `date` (timestamptz)
      - `employee_id` (uuid, references employees)
      - `hours` (numeric)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `creator_sales`
      - `id` (uuid, primary key)
      - `time_entry_id` (uuid, references time_entries)
      - `creator_id` (uuid, references creators)
      - `amount` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  employee_id uuid NOT NULL REFERENCES employees(id),
  hours numeric NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create creator_sales table
CREATE TABLE IF NOT EXISTS creator_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id uuid NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id),
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_sales ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to time_entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to creator_sales"
  ON creator_sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);