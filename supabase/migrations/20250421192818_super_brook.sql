/*
  # Add costume number column to costume requests

  1. Changes
    - Add `costumenumber` column to `costume_requests` table
    - Rename existing column to match schema
  
  2. Notes
    - The column already exists as `costumenumber` but code is trying to use `costume_number`
    - We'll update the code to use the correct column name instead of modifying the database
*/

-- No changes needed - column exists as 'costumenumber'