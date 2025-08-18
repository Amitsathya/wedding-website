-- Add new fields for guest registration and approval workflow
ALTER TABLE guests 
ADD COLUMN guest_portal_token VARCHAR(255) UNIQUE,
ADD COLUMN registration_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN approved_at TIMESTAMP NULL;

-- Update existing records to have portal tokens (you may want to generate these programmatically)
-- For now, we'll leave them NULL and generate them when needed

-- Add index for faster lookups
CREATE INDEX idx_guests_registration_status ON guests(registration_status);
CREATE INDEX idx_guests_guest_portal_token ON guests(guest_portal_token);

-- Make invite_token nullable since new registrations won't have one initially
ALTER TABLE guests ALTER COLUMN invite_token DROP NOT NULL;