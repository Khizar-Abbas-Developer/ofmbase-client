-- Delete all related records first
DELETE FROM creator_sales;
DELETE FROM content_requests WHERE creator_id IS NOT NULL;
DELETE FROM costume_requests WHERE creator_id IS NOT NULL;
DELETE FROM scheduled_posts WHERE creator_id IS NOT NULL;
DELETE FROM transactions WHERE creator_id IS NOT NULL;
DELETE FROM credentials WHERE creator_id IS NOT NULL;

-- Delete creator records
DELETE FROM creators;

-- Delete profiles for non-agency creators only
DELETE FROM profiles 
WHERE type = 'creator' 
AND id NOT IN (
  SELECT profile_id FROM agencies
);