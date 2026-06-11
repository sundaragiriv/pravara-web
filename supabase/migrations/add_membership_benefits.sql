-- ============================================================
-- Pravara — Signup membership benefits (founders + new-user trial)
--
-- Business rules:
--   • Founders  — anyone whose email is already in launch_registrations
--                 (pre-launch sign-ups) gets GOLD free for 3 months.
--   • New users — everyone else who signs up gets GOLD free for 1 month
--                 as a trial, then drops to BASIC (free) automatically when
--                 the window lapses (enforced at read-time / billing, not here).
--
-- HOW IT WORKS
--   A trigger on auth.users runs once per new account and stamps the benefit
--   onto the profiles row (creating a stub row if onboarding hasn't yet).
--   It is wrapped in an exception guard so a failure can NEVER block signup.
--
-- SAFE TO TUNE: change the two interval literals / tier below in one place.
--
-- APPLY AT GO-LIVE: test on a Supabase preview branch first. Until launch,
--   public users never create auth accounts (they use /register), so this only
--   affects internal testers if run early — harmless.
--
-- Run in Supabase: Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Mark founders on the profile for easy querying / badges.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS founding_member BOOLEAN NOT NULL DEFAULT false;

-- 2. Benefit-granting function (SECURITY DEFINER so it can read auth.users
--    and write profiles / launch_registrations regardless of the caller).
CREATE OR REPLACE FUNCTION public.apply_signup_membership_benefit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name      TEXT;
  v_is_founder BOOLEAN := false;
  v_months    INT := 1;          -- new-user trial length
  v_reg_id    UUID;
BEGIN
  v_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
    split_part(NEW.email, '@', 1)
  );

  -- Founder? (registered during pre-launch and still eligible)
  SELECT id INTO v_reg_id
  FROM public.launch_registrations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND premium_offer_eligible = true
    AND status IN ('registered', 'approved', 'invited')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_reg_id IS NOT NULL THEN
    v_is_founder := true;
    v_months := 3;               -- founders: 3 months premium
  END IF;

  -- Stamp the benefit onto the profile (create stub if onboarding hasn't run).
  INSERT INTO public.profiles (id, full_name, membership_tier,
                               subscription_start_date, subscription_end_date,
                               founding_member)
  VALUES (NEW.id, v_name, 'Gold',
          NOW(), NOW() + make_interval(months => v_months),
          v_is_founder)
  ON CONFLICT (id) DO UPDATE SET
    membership_tier         = 'Gold',
    subscription_start_date = NOW(),
    subscription_end_date   = NOW() + make_interval(months => v_months),
    founding_member         = v_is_founder;

  -- Record that the founder has now claimed their account.
  IF v_is_founder THEN
    UPDATE public.launch_registrations
    SET status = 'invited', launch_invited_at = NOW()
    WHERE id = v_reg_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block account creation because of a benefit-grant hiccup.
    RAISE WARNING 'apply_signup_membership_benefit failed for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Fire once per new auth user.
DROP TRIGGER IF EXISTS trg_apply_signup_membership_benefit ON auth.users;
CREATE TRIGGER trg_apply_signup_membership_benefit
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.apply_signup_membership_benefit();
