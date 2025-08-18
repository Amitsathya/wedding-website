-- Create messages table for guest portal messaging
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    guest_token VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Add indexes for faster lookups
CREATE INDEX idx_messages_guest_token ON messages(guest_token);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at);