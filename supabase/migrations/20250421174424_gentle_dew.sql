/*
  # Update Creator Status

  1. Changes
    - Update status of existing creators to 'active'
    - Add check constraint for valid status values
*/

-- Update existing creators to active status
UPDATE creators 
SET status = 'active' 
WHERE status = 'invited';

-- Add check constraint for status
ALTER TABLE creators 
ADD CONSTRAINT creators_status_check 
CHECK (status IN ('active', 'invited', 'inactive'));