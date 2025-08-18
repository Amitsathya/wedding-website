-- Reverse the changes from the up migration
DROP INDEX IF EXISTS idx_photos_guest_token;

ALTER TABLE photos 
DROP COLUMN IF EXISTS guest_name,
DROP COLUMN IF EXISTS guest_token;