-- AgentRadar: Add logos to existing seed listings
-- Downloads were saved to frontend/public/logos/

UPDATE listings SET logo_url = '/logos/joule-finance.png' WHERE slug = 'joule-finance';
UPDATE listings SET logo_url = '/logos/dotbit.svg' WHERE slug = 'dotbit';
UPDATE listings SET logo_url = '/logos/nervape.png' WHERE slug = 'nervape';
UPDATE listings SET logo_url = '/logos/ocean-protocol.svg' WHERE slug = 'ocean-protocol';
UPDATE listings SET logo_url = '/logos/bittensor.svg' WHERE slug = 'bittensor';
UPDATE listings SET logo_url = '/logos/xmtp.svg' WHERE slug = 'xmtp';
UPDATE listings SET logo_url = '/logos/singularitynet.svg' WHERE slug = 'singularitynet';
UPDATE listings SET logo_url = '/logos/lit-protocol.svg' WHERE slug = 'lit-protocol';
UPDATE listings SET logo_url = '/logos/phala.svg' WHERE slug = 'phala-network';
UPDATE listings SET logo_url = '/logos/solana-agent-kit.png' WHERE slug = 'solana-agent-kit';
UPDATE listings SET logo_url = '/logos/ordinals-ai.png' WHERE slug = 'ordinals-ai';
