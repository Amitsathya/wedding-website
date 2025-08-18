-- Remove questionnaire fields from guests table
ALTER TABLE guests 
DROP COLUMN IF EXISTS party_members,
DROP COLUMN IF EXISTS wedding_attendance,
DROP COLUMN IF EXISTS wedding_meal,
DROP COLUMN IF EXISTS raaga_riti_attendance,
DROP COLUMN IF EXISTS raaga_riti_meal,
DROP COLUMN IF EXISTS accommodation,
DROP COLUMN IF EXISTS accommodation_dates,
DROP COLUMN IF EXISTS additional_days,
DROP COLUMN IF EXISTS concerns;

-- Drop indexes
DROP INDEX IF EXISTS idx_guests_wedding_attendance;
DROP INDEX IF EXISTS idx_guests_raaga_riti_attendance;
DROP INDEX IF EXISTS idx_guests_accommodation;