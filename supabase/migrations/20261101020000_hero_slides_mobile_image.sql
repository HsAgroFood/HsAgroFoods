-- Separate phone (4:5) image for hero slides. NULL = auto-crop the desktop image.
ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS image_mobile_url TEXT;
