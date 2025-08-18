CREATE TABLE IF NOT EXISTS rsvps (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL,
    response VARCHAR(50) NOT NULL,
    party_size INTEGER DEFAULT 1,
    meal_choice VARCHAR(100),
    dietary_restrictions TEXT,
    message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_id ON rsvps(guest_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_response ON rsvps(response);
CREATE INDEX IF NOT EXISTS idx_rsvps_responded_at ON rsvps(responded_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_deleted_at ON rsvps(deleted_at);