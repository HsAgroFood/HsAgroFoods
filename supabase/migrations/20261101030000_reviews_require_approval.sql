-- New reviews are pending until an admin approves them. Existing rows are left untouched.
ALTER TABLE public.reviews ALTER COLUMN is_approved SET DEFAULT false;
