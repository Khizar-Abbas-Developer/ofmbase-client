-- Create costume_requests table
CREATE TABLE IF NOT EXISTS costume_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subName text NOT NULL,
  creator_id uuid REFERENCES creators(id),
  costumeNumber text NOT NULL,
  videoType text,
  videoLength text,
  subRequest text,
  outfitDescription text,
  payment numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE costume_requests ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow authenticated users full access to costume_requests"
  ON costume_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);