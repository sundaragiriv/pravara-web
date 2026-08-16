-- ============================================================
-- PRIVACY — stop anonymous visitors reading member data
--
-- Found by the baseline dump, which is exactly what it was for.
--
-- Three policies grant SELECT `TO public`, which in Supabase means the
-- anon role — anyone holding the publishable key, and that key ships in
-- the browser bundle by design:
--
--   profiles         USING (is_visible = true OR auth.uid() = id)
--   profile_photos   USING (true)
--   endorsements     USING (true)
--
-- Verified, not assumed. Querying production with the anon key returns
-- member names. In dev, 150 of 151 profiles come back to an anonymous
-- caller carrying full_name, email, date of birth, bio, location and
-- gothra. Production is small today only because almost nobody has
-- registered yet; the exposure grows with every signup.
--
-- The privacy policy currently says, live on the site:
--
--   "We never expose your contact details (phone, email) to other users."
--   "We never make your profile publicly searchable outside the Pravara
--    platform."
--
-- Both are untrue while these policies stand.
--
-- Nothing needs anonymous access. The one public page that shows a
-- member's name — /vouch/[id] — takes it from the query string, and the
-- vouch API writes through the service-role client.
--
-- The predicates are unchanged. Only the role changes, from public to
-- authenticated, so nothing about who can see what among members moves.
--
-- Verify afterwards with: npm run check:safety
--
-- Run in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- (dev first, then production)
-- ============================================================

-- ── PROFILES ────────────────────────────────────────────────────────────────

DO $$
DECLARE policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  LOOP
    RAISE NOTICE 'Dropping SELECT policy on profiles: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.profiles', policy_name);
  END LOOP;
END $$;

-- Same reach as before among members: a visible profile, or your own.
-- Admins are added explicitly because the console reads through the
-- member's own client, so it could not previously see a profile whose
-- owner had switched visibility off.
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_visible = true
    OR id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ── PROFILE PHOTOS ──────────────────────────────────────────────────────────
-- USING (true) meant every member photo on the platform was readable by
-- anyone with the publishable key.

DO $$
DECLARE policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profile_photos' AND cmd = 'SELECT'
  LOOP
    RAISE NOTICE 'Dropping SELECT policy on profile_photos: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.profile_photos', policy_name);
  END LOOP;
END $$;

CREATE POLICY "profile_photos_select"
  ON public.profile_photos FOR SELECT
  TO authenticated
  USING (true);

-- ── ENDORSEMENTS ────────────────────────────────────────────────────────────
-- Vouches name the person vouching and what they said about the family.
-- They are shown on a profile, so any member may read them — but a member,
-- not the open internet.

DO $$
DECLARE policy_name TEXT;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'endorsements' AND cmd = 'SELECT'
  LOOP
    RAISE NOTICE 'Dropping SELECT policy on endorsements: %', policy_name;
    EXECUTE format('DROP POLICY %I ON public.endorsements', policy_name);
  END LOOP;
END $$;

CREATE POLICY "endorsements_select"
  ON public.endorsements FOR SELECT
  TO authenticated
  USING (true);

-- ── TIGHTEN THE REST ────────────────────────────────────────────────────────
-- These already gate on auth.uid(), so an anonymous caller gets nothing
-- from them. Granting them TO public is simply wider than needed, and a
-- policy that says `public` invites the reader to assume public access was
-- intended. Restated against authenticated so the grant matches the intent.

DROP POLICY IF EXISTS "Users can view their own connections"    ON public.connections;
CREATE POLICY "connections_select"
  ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send requests"                 ON public.connections;
CREATE POLICY "connections_insert"
  ON public.connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their own connections"  ON public.connections;
CREATE POLICY "connections_update"
  ON public.connections FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view their own notifications"  ON public.notifications;
CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- A duplicate of collaborators_can_view_own_invites, and narrower — it
-- omits the invitee, so it grants nothing the other does not already.
-- Dropped rather than restated, for the reason this whole exercise keeps
-- proving: two policies on one command is a table where nobody can say
-- what is permitted.
DROP POLICY IF EXISTS "Users can view their own collaborators"  ON public.collaborators;
DROP POLICY IF EXISTS "Users can add collaborators"             ON public.collaborators;

DROP POLICY IF EXISTS "Users can insert their own profile"      ON public.profiles;
CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile"            ON public.profiles;
CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can upload their own photos"       ON public.profile_photos;
CREATE POLICY "profile_photos_insert"
  ON public.profile_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own photos"       ON public.profile_photos;
CREATE POLICY "profile_photos_delete"
  ON public.profile_photos FOR DELETE TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "View Access Requests"                    ON public.photo_access;
CREATE POLICY "photo_access_select"
  ON public.photo_access FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = target_id);

DROP POLICY IF EXISTS "Create Request"                          ON public.photo_access;
CREATE POLICY "photo_access_insert"
  ON public.photo_access FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Update Request"                          ON public.photo_access;
CREATE POLICY "photo_access_update"
  ON public.photo_access FOR UPDATE TO authenticated
  USING (auth.uid() = target_id);

-- ── What is left granted to anon ────────────────────────────────────────────
-- Expect only the reference tables: gothras, nakshatras, raasis, languages,
-- communities and the compatibility lookups. Those are dictionaries, not
-- member data, and the registration form needs them before sign-in.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND ('anon' = ANY(roles) OR 'public' = ANY(roles))
ORDER BY tablename, policyname;
