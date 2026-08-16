-- ============================================================
-- URGENT — profiles reads are returning 500
--
-- My fault, and it is live in both databases. Run this now.
--
-- fix_anonymous_profile_exposure.sql added an admin clause to the
-- profiles SELECT policy:
--
--   OR EXISTS (SELECT 1 FROM public.profiles p
--              WHERE p.id = auth.uid() AND p.is_admin = true)
--
-- A subquery on `profiles` inside a policy ON `profiles` recurses. Every
-- read now fails with:
--
--   42P17  infinite recursion detected in policy for relation "profiles"
--
-- The pattern is used safely on half a dozen other tables — the admin
-- checks on reports, coupons and site_config all query profiles from a
-- DIFFERENT table's policy, which is fine. On profiles itself it is not,
-- and I did not think about it before writing.
--
-- It also takes down anything whose own policy consults profiles: reports
-- stopped working for both admins and reporters, which is how the safety
-- tests caught it.
--
-- The fix is a SECURITY DEFINER function. It reads profiles with the
-- definer's rights, so RLS is not re-entered and the recursion cannot
-- occur. Same approach as is_blocked_between().
--
-- Verify afterwards with: npm run check:safety && npm run walk
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ── PROFILES ────────────────────────────────────────────────────────────────

DO $$
DECLARE policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', policy_name);
  END LOOP;
END $$;

CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_visible = true
    OR id = auth.uid()
    OR public.is_admin()
  );

-- ── Confirm ─────────────────────────────────────────────────────────────────
-- Should return one row and no error. If this errors, the recursion is
-- still there.
SELECT count(*) AS profiles_readable FROM public.profiles;
