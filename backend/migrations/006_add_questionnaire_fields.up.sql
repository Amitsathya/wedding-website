-- Add questionnaire fields to guests table
ALTER TABLE guests 
ADD COLUMN party_members JSONB,
ADD COLUMN wedding_attendance VARCHAR(10),
ADD COLUMN wedding_meal VARCHAR(20),
ADD COLUMN raaga_riti_attendance VARCHAR(10),
ADD COLUMN raaga_riti_meal VARCHAR(20),
ADD COLUMN accommodation VARCHAR(10),
ADD COLUMN accommodation_dates JSONB,
ADD COLUMN additional_days TEXT,
ADD COLUMN concerns TEXT;

-- Add indexes for faster lookups
CREATE INDEX idx_guests_wedding_attendance ON guests(wedding_attendance);
CREATE INDEX idx_guests_raaga_riti_attendance ON guests(raaga_riti_attendance);
CREATE INDEX idx_guests_accommodation ON guests(accommodation);