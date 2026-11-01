-- Homepage "Reels" section: short videos (max 10) with a caption, managed in /admin/reels.
-- The 10-video limit is enforced in the admin server action; display_order controls the left-to-right order.
CREATE TABLE IF NOT EXISTS public.reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT NOT NULL,                    -- ImageKit video URL
  caption TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reels_order ON public.reels(display_order, created_at);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Active Reels" ON public.reels;
CREATE POLICY "Public Read Active Reels" ON public.reels FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Service Role Full Access Reels" ON public.reels;
CREATE POLICY "Service Role Full Access Reels" ON public.reels FOR ALL TO service_role USING (true) WITH CHECK (true);
