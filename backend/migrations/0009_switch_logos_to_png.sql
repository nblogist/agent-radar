-- Switch all logo_url references from .svg to .png
-- User will manually crop the PNGs to square icons

UPDATE listings SET logo_url = REPLACE(logo_url, '.svg', '.png')
WHERE logo_url LIKE '/logos/%.svg';
