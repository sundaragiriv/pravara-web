-- Carry the new registration fields into the profile on signup.
--
-- The register form now collects a date of birth, a state and a city, and
-- Narada's onboarding walks a list of fields and asks about whichever ones are
-- still empty. Anything not copied across here is therefore asked a second
-- time, of someone who has already answered it — which is the specific
-- complaint this addresses.
--
-- Replaces the body of apply_signup_membership_benefit; everything the previous
-- version did is preserved.

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
    -- Prefer the name as registered. first_name/last_name are the fields the
    -- form now collects; full_name is still written alongside them.
    v_name := COALESCE(
      NULLIF(TRIM(CONCAT_WS(' ', v_reg.first_name, v_reg.last_name)), ''),
      NULLIF(v_reg.full_name, ''),
      NULLIF(v_name, '')
    );
  END IF;

  INSERT INTO public.profiles (id, full_name, gender, profession, location,
                               dob, age, country, state, current_city, current_state,
                               membership_tier, subscription_start_date,
                               subscription_end_date, founding_member)
  VALUES (NEW.id, v_name, NULLIF(v_reg.gender, ''), NULLIF(v_reg.profession, ''),
          NULLIF(v_reg.location, ''),
          v_reg.dob, v_reg.age,
          NULLIF(v_reg.country, ''), NULLIF(v_reg.state, ''),
          NULLIF(v_reg.city, ''), NULLIF(v_reg.state, ''),
          'Gold', NOW(),
          NOW() + make_interval(months => v_months), v_is_founder)
  ON CONFLICT (id) DO UPDATE SET
    -- COALESCE on the existing value throughout: a member who has already
    -- edited their profile must not have it overwritten by what they typed
    -- into a registration form months earlier.
    full_name               = COALESCE(profiles.full_name, EXCLUDED.full_name),
    gender                  = COALESCE(profiles.gender, EXCLUDED.gender),
    profession              = COALESCE(profiles.profession, EXCLUDED.profession),
    location                = COALESCE(profiles.location, EXCLUDED.location),
    dob                     = COALESCE(profiles.dob, EXCLUDED.dob),
    age                     = COALESCE(profiles.age, EXCLUDED.age),
    country                 = COALESCE(profiles.country, EXCLUDED.country),
    state                   = COALESCE(profiles.state, EXCLUDED.state),
    current_city            = COALESCE(profiles.current_city, EXCLUDED.current_city),
    current_state           = COALESCE(profiles.current_state, EXCLUDED.current_state),
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
