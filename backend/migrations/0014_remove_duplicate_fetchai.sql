-- Remove duplicate Fetch.ai listing (slug 'fetchai' from 0007, keep 'fetch-ai' from 0004)

BEGIN;

DELETE FROM listing_categories WHERE listing_id = (SELECT id FROM listings WHERE slug = 'fetchai');
DELETE FROM listing_chains WHERE listing_id = (SELECT id FROM listings WHERE slug = 'fetchai');
DELETE FROM listing_tags WHERE listing_id = (SELECT id FROM listings WHERE slug = 'fetchai');
DELETE FROM listings WHERE slug = 'fetchai';

-- Recompute denormalized counts
UPDATE categories SET listing_count = (
    SELECT COUNT(*) FROM listing_categories WHERE category_id = categories.id
);
UPDATE tags SET listing_count = (
    SELECT COUNT(*) FROM listing_tags WHERE tag_id = tags.id
);

COMMIT;
