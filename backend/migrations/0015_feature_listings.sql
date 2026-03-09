-- Feature 5 diverse, high-quality listings across different categories

BEGIN;

UPDATE listings SET is_featured = true
WHERE slug IN (
    'fetch-ai',
    'langchain',
    'model-context-protocol',
    'bittensor',
    'lit-protocol'
);

COMMIT;
