-- Create creatives table for advertiser content uploads
CREATE TABLE IF NOT EXISTS public.creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  file_type TEXT CHECK (file_type IN ('image','video')),
  storage_path TEXT,
  public_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on creatives
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;

-- Advertisers can manage their creatives
CREATE POLICY "Advertisers can manage their creatives"
ON public.creatives
FOR ALL
USING (advertiser_id = auth.uid())
WITH CHECK (advertiser_id = auth.uid());

-- Screen owners can view creatives associated to bookings on their screens
CREATE POLICY "Screen owners can view creatives for their screens"
ON public.creatives
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.campaign_id = creatives.campaign_id
      AND b.screen_id IN (SELECT s.id FROM public.screens s WHERE s.owner_id = auth.uid())
  )
);

-- Updated_at trigger (uses existing pattern)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_creatives_updated_at ON public.creatives;
CREATE TRIGGER set_creatives_updated_at
BEFORE UPDATE ON public.creatives
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create a public storage bucket for creatives (for demo; can tighten later)
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for creatives bucket
-- Public read access to creatives
CREATE POLICY "Public read creatives"
ON storage.objects FOR SELECT
USING (bucket_id = 'creatives');

-- Authenticated users can upload/update/delete within their user-id folder
CREATE POLICY "Users can upload to their creatives folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creatives'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own creatives"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'creatives'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own creatives"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'creatives'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- CMS integration fields on screens
ALTER TABLE public.screens
ADD COLUMN IF NOT EXISTS cms_api_url TEXT,
ADD COLUMN IF NOT EXISTS cms_api_key TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS content_sync_interval INTEGER NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS auto_approve_bookings BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS realtime_updates BOOLEAN NOT NULL DEFAULT true;

-- Allow screen owners to update bookings for their screens (e.g., approve/reject)
CREATE POLICY "Screen owners can update bookings for their screens"
ON public.bookings
FOR UPDATE
USING (screen_id IN (SELECT id FROM public.screens WHERE owner_id = auth.uid()))
WITH CHECK (screen_id IN (SELECT id FROM public.screens WHERE owner_id = auth.uid()));