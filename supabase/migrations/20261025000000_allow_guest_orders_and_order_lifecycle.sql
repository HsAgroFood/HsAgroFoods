-- Guest checkout stores contact and delivery details in shipping_address.
-- Orders must not be attributed to an unrelated customer when no account matches.
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

-- Keep admin/customer tracking timestamps available on databases created from
-- an older schema, while remaining safe on databases that already have them.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
