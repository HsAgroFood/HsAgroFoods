-- Admin-managed discount coupons.
-- Customers redeem them in the cart; the server re-validates at checkout and stores the result on the order.

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                       -- always stored UPPERCASE
  description TEXT,                                -- shown to the customer, e.g. "10% off your first order"
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_discount NUMERIC(10,2) CHECK (max_discount IS NULL OR max_discount > 0),  -- cap for percent coupons
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),            -- total redemptions, NULL = unlimited
  per_customer_limit INTEGER CHECK (per_customer_limit IS NULL OR per_customer_limit > 0),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Codes are looked up only by the server (service role), so customers cannot list or guess them.
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service Role Full Access Coupons" ON public.coupons;
CREATE POLICY "Service Role Full Access Coupons" ON public.coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

-- What was applied to each order
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code) WHERE coupon_code IS NOT NULL;
