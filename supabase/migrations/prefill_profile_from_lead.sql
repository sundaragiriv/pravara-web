-- On signup, copy what the founder already gave on the register form (gender,
-- profession, location) into their profile so onboarding doesn't re-ask it.
-- Updates the existing apply_signup_membership_benefit trigger function.
-- (Full body applied to prod 2026-06-12; see migration history.)
CREATE OR REPLACE FUNCTION public.apply_signup_membership_benefit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name       TEXT;
  v_is_founder BOOLEAN := false;
  v_months     INT := 1;
  v_reg        public.launch_registrations%ROWTYPE;
BEGIN
  v_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    split_part(NEW.email, '@', 1)
  );

  SELECT * INTO v_reg
  FROM public.launch_registrations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND premium_offer_eligible = true
    AND status IN ('registered', 'approved', 'invited')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_reg.id IS NOT NULL THEN
    v_is_founder := true;
    v_months := 3;
    v_name := COALESCE(NULLIF(v_name, ''), v_reg.full_name);
  END IF;

  INSERT INTO public.profiles (id, full_name, gender, profession, location,
                               membership_tier, subscription_start_date,
                               subscription_end_date, founding_member)
  VALUES (NEW.id, v_name, NULLIF(v_reg.gender, ''), NULLIF(v_reg.profession, ''),
          NULLIF(v_reg.location, ''), 'Gold', NOW(),
          NOW() + make_interval(months => v_months), v_is_founder)
  ON CONFLICT (id) DO UPDATE SET
    full_name               = COALESCE(profiles.full_name, EXCLUDED.full_name),
    gender                  = COALESCE(profiles.gender, EXCLUDED.gender),
    profession              = COALESCE(profiles.profession, EXCLUDED.profession),
    location                = COALESCE(profiles.location, EXCLUDED.location),
    membership_tier         = 'Gold',
    subscription_start_date = NOW(),
    subscription_end_date   = NOW() + make_interval(months => v_months),
    founding_member         = v_is_founder;

  IF v_is_founder THEN
    UPDATE public.launch_registrations
    SET status = 'invited', launch_invited_at = NOW()
    WHERE id = v_reg.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'apply_signup_membership_benefit failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
