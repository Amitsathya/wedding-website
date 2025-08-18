-- Add guest fields to photos table for guest portal uploads
ALTER TABLE photos 
ADD COLUMN guest_token VARCHAR(255),
ADD COLUMN guest_name VARCHAR(255);

-- Add index for faster lookups by guest token
CREATE INDEX idx_photos_guest_token ON photos(guest_token);