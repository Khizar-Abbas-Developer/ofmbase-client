/*
  # Add Media URLs Support to Content Requests

  1. Changes
    - Add media_urls column to content_requests table
    - Add array type to store multiple media URLs
    - Update existing rows with empty array

  2. Notes
    - Uses text[] to store multiple URLs
    - Maintains existing data
*/

-- Add media_urls column to content_requests table
ALTER TABLE content_requests
ADD COLUMN IF NOT EXISTS media_urls text[];

-- Update existing rows with empty array
UPDATE content_requests
SET media_urls = '{}'
WHERE media_urls IS NULL;