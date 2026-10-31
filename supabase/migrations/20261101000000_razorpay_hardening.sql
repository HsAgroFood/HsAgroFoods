-- =============================================================
-- Migration: Razorpay payment hardening
-- Description: A Razorpay order / payment id can belong to at most one
--              order, so a captured payment can never be applied twice
--              or to a different order. Also speeds up webhook lookups.
-- =============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_razorpay_payment_id
  ON public.orders (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_razorpay_order_id
  ON public.orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;
