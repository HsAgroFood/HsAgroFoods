-- =============================================================
-- Migration: Login OTP table
-- Description: Email OTP login for existing accounts
--              (10-minute validity, 60-second resend cooldown
--              enforced in app code via created_at).
-- =============================================================

CREATE TABLE IF NOT EXISTS public.auth_login_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_login_otps_email ON public.auth_login_otps (email);

-- Accessible solely through the service_role admin client
ALTER TABLE public.auth_login_otps ENABLE ROW LEVEL SECURITY;
