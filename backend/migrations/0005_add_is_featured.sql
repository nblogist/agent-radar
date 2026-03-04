-- Add is_featured boolean to listings table for Nervos/CKB featured toggle
ALTER TABLE listings ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX listings_is_featured_idx ON listings (is_featured) WHERE is_featured = true;
