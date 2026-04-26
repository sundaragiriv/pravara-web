CREATE TABLE IF NOT EXISTS public.launch_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age SMALLINT NOT NULL CHECK (age >= 18 AND age <= 80),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  profession TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'approved', 'invited', 'archived')),
  source TEXT NOT NULL DEFAULT 'launch-homepage',
  premium_offer_eligible BOOLEAN NOT NULL DEFAULT true,
  launch_invited_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_launch_registrations_email_unique
  ON public.launch_registrations (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_launch_registrations_created_at
  ON public.launch_registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_launch_registrations_status
  ON public.launch_registrations (status);

ALTER TABLE public.launch_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_manage_launch_registrations" ON public.launch_registrations;
CREATE POLICY "service_role_manage_launch_registrations"
  ON public.launch_registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_launch_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_launch_registrations_updated_at ON public.launch_registrations;
CREATE TRIGGER trg_launch_registrations_updated_at
BEFORE UPDATE ON public.launch_registrations
FOR EACH ROW
EXECUTE FUNCTION public.set_launch_registrations_updated_at();
