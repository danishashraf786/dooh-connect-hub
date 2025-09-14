-- Update campaigns table to link with creatives
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS creative_id uuid REFERENCES creatives(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_creative_id ON campaigns(creative_id);

-- Update creatives table to ensure proper file handling
ALTER TABLE creatives 
  ALTER COLUMN advertiser_id SET NOT NULL,
  ALTER COLUMN public_url SET NOT NULL;

-- Add trigger for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_creatives_updated_at
  BEFORE UPDATE ON creatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();