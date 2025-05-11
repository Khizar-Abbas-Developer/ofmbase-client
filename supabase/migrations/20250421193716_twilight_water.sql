/*
  # Add media_urls column to scheduled_posts table

  1. Changes
    - Add `media_urls` column to `scheduled_posts` table to store media file URLs
      - Type: text[] (array of strings)
      - Nullable: true (posts may not have media)

  2. Security
    - No changes to RLS policies needed as the table already has appropriate policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scheduled_posts' 
    AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE scheduled_posts 
    ADD COLUMN media_urls text[] DEFAULT NULL;
  END IF;
END $$;