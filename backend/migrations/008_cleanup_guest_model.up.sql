-- Remove redundant fields from guests table to simplify the model
ALTER TABLE guests 
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS invite_sent_at,
DROP COLUMN IF EXISTS household_id;

-- Drop unused tables (if they exist)
DROP TABLE IF EXISTS guest_tag_maps;
DROP TABLE IF EXISTS guest_tags;
DROP TABLE IF EXISTS households;