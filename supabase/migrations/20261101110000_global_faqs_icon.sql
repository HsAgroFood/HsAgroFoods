-- Optional icon for each homepage FAQ card, picked in Admin > Global FAQs. NULL = auto-pick from the question text.
ALTER TABLE public.global_faqs ADD COLUMN IF NOT EXISTS icon TEXT;
