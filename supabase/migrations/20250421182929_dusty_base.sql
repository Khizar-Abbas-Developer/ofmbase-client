/*
  # Add Transactions Table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `date` (timestamptz)
      - `type` (text) - 'income' | 'expense'
      - `category` (text)
      - `entity` (text)
      - `description` (text)
      - `amount` (numeric)
      - `creator_id` (uuid, references creators)
      - `employee_id` (uuid, references employees)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  entity text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  creator_id uuid REFERENCES creators(id),
  employee_id uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);