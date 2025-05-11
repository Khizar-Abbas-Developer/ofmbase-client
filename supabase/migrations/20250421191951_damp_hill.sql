/*
  # Create storage bucket for media uploads

  1. New Storage Bucket
    - Creates a new public storage bucket named 'media' for storing content request files
    - Enables public access for the bucket
*/

-- Create a new storage bucket named 'media'
insert into storage.buckets (id, name, public)
values ('media', 'media', true);

-- Create a policy to allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

-- Create a policy to allow public access to read files
create policy "Allow public access to read files"
on storage.objects
for select
to public
using (bucket_id = 'media');