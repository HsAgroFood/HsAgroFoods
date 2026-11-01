-- Emails collected by the footer "Join Purity Club" box, shown to the admin in /admin/subscribers.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,                 -- stored lowercase
  source TEXT NOT NULL DEFAULT 'footer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role Full Access Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Service Role Full Access Newsletter" ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Bring over earlier sign-ups that were stored as inquiries (the old rows are left untouched).
INSERT INTO public.newsletter_subscribers (email, source, created_at)
SELECT lower(email), 'footer', min(created_at)
FROM public.inquiries
WHERE name = 'Purity Club Subscriber'
GROUP BY lower(email)
ON CONFLICT (email) DO NOTHING;
