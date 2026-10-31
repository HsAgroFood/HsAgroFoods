-- =============================================================
-- Migration: iThink Logistics shipping
-- Description: Per-variant default parcel weight/dimensions (admin editable)
--              and shipment tracking columns on orders.
-- =============================================================

-- 1. Default parcel weight (kg) & dimensions (cm) per variant
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,3) NOT NULL DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS length_cm NUMERIC(6,1) NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS width_cm  NUMERIC(6,1) NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(6,1) NOT NULL DEFAULT 4;

-- Pre-fill for the existing pouch sizes (pack weight + packaging).
-- Only touches rows still at the column defaults so re-running never
-- overwrites values an admin has already edited.
UPDATE public.product_variants SET weight_kg = 0.12, length_cm = 15, width_cm = 10, height_cm = 3
  WHERE variant_name ~* '(^|[^0-9])100\s*g'
    AND weight_kg = 0.25 AND length_cm = 15 AND width_cm = 12 AND height_cm = 4;

UPDATE public.product_variants SET weight_kg = 0.28, length_cm = 18, width_cm = 12, height_cm = 4
  WHERE variant_name ~* '(^|[^0-9])250\s*g'
    AND weight_kg = 0.25 AND length_cm = 15 AND width_cm = 12 AND height_cm = 4;

UPDATE public.product_variants SET weight_kg = 0.55, length_cm = 22, width_cm = 15, height_cm = 5
  WHERE variant_name ~* '(^|[^0-9])500\s*g'
    AND weight_kg = 0.25 AND length_cm = 15 AND width_cm = 12 AND height_cm = 4;

UPDATE public.product_variants SET weight_kg = 1.08, length_cm = 25, width_cm = 18, height_cm = 7
  WHERE variant_name ~* '(^|[^0-9])1\s*kg'
    AND weight_kg = 0.25 AND length_cm = 15 AND width_cm = 12 AND height_cm = 4;

-- 2. Shipment columns on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS awb_number TEXT,
  ADD COLUMN IF NOT EXISTS courier_name TEXT,
  ADD COLUMN IF NOT EXISTS shipment_error TEXT,
  ADD COLUMN IF NOT EXISTS shipment_response JSONB,
  ADD COLUMN IF NOT EXISTS shipment_weight_kg NUMERIC(6,3),
  ADD COLUMN IF NOT EXISTS shipment_length_cm NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS shipment_width_cm NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS shipment_height_cm NUMERIC(6,1),
  ADD COLUMN IF NOT EXISTS shipment_created_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_awb_number ON public.orders (awb_number)
  WHERE awb_number IS NOT NULL;
