-- Remove logo_url for listings with bad/deleted logos — they'll show initials instead
UPDATE listings SET logo_url = NULL WHERE slug IN (
  'langfuse',
  'microsoft-autogen',
  'model-context-protocol',
  'bittensor',
  'solana-agent-kit'
);
