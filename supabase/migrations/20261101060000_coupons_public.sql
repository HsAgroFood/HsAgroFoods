-- Lets the admin decide which coupons are suggested to customers in the cart.
-- Hidden (is_public = false) coupons still work, but only for people who know the code.
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
