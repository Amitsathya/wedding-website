-- Reverse the changes from the up migration
DROP INDEX IF EXISTS idx_guests_guest_portal_token;
DROP INDEX IF EXISTS idx_guests_registration_status;

ALTER TABLE guests 
DROP COLUMN IF EXISTS approved_at,
DROP COLUMN IF EXISTS registration_status,
DROP COLUMN IF EXISTS guest_portal_token;

-- Restore invite_token as NOT NULL (this might fail if there are NULL values)
-- ALTER TABLE guests ALTER COLUMN invite_token SET NOT NULL;