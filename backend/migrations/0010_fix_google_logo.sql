-- Google ADK: use SVG instead of bad PNG conversion
UPDATE listings SET logo_url = '/logos/google.svg' WHERE slug = 'google-adk';

-- Ensure openclaw is .png (in case 0009 missed it)
UPDATE listings SET logo_url = '/logos/openclaw.png'
WHERE slug = 'openclaw' AND logo_url LIKE '%.svg';
