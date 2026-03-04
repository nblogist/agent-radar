-- Add indexes on junction table foreign keys for faster JOINs
CREATE INDEX IF NOT EXISTS listing_categories_category_id_idx ON listing_categories (category_id);
CREATE INDEX IF NOT EXISTS listing_tags_tag_id_idx ON listing_tags (tag_id);
CREATE INDEX IF NOT EXISTS listing_chains_chain_id_idx ON listing_chains (chain_id);
