-- Admin-editable tag shown next to a category in the storefront menu (replaces hardcoded labels).
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS badge_text TEXT;

-- Keep today's labels for the existing categories so the menu looks the same until edited.
UPDATE public.categories SET badge_text = '100% Pure'
  WHERE badge_text IS NULL AND slug IN ('ground-spices', 'pure-ground-spices');
UPDATE public.categories SET badge_text = 'Royal Recipes'
  WHERE badge_text IS NULL AND slug IN ('blended-spices', 'blended-masalas');
UPDATE public.categories SET badge_text = 'Zero Additives'
  WHERE badge_text IS NULL AND slug = 'dehydrated-powders';
