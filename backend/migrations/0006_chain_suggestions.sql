-- Chain suggestions: users can suggest new chains during submission.
-- Admin can review and approve (which creates a real chain_support entry).
CREATE TABLE IF NOT EXISTS chain_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX chain_suggestions_status_idx ON chain_suggestions (status);
CREATE INDEX chain_suggestions_listing_id_idx ON chain_suggestions (listing_id);
