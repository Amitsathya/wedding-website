-- Reverse the cleanup changes (add back the removed fields)
ALTER TABLE guests 
ADD COLUMN notes TEXT,
ADD COLUMN status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN invite_sent_at TIMESTAMP NULL,
ADD COLUMN household_id INTEGER;

-- Note: We don't recreate the dropped tables as they would lose data
-- and are no longer needed in the simplified model