/*
  # Initial Schema Setup

  1. New Tables
    - `creators`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `age` (integer)
      - `country` (text)
      - `status` (text)
      - `bio` (text)
      - `hobbies` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text)
      - `hourly_rate` (numeric)
      - `payment_schedule` (text)
      - `payment_method` (text)
      - `paypal_email` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  age integer,
  country text,
  status text NOT NULL DEFAULT 'invited',
  bio text,
  hobbies text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employees table
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

-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access to creators"
  ON creators
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);