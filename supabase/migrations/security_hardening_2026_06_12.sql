-- ============================================================
-- Security hardening — applied to project ybwltjpsxpimwdttwken on 2026-06-12.
-- Took the Supabase security advisor from 65 findings (8 ERROR) down to 2 WARN.
-- Recorded here so the repo reflects the live DB.
-- ============================================================

-- 1. RLS + read-only public policy on reference/lookup tables (cleared 8 ERRORs).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ref_languages','ref_communities','ref_sub_communities','ref_gothras',
    'ref_nakshatras','ref_raasis','ref_yoni_compat','ref_planet_friendship'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%s" ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY "public_read_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t, t
    );
  END LOOP;
END $$;

-- 2. Pin search_path on flagged functions.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname IN ('notify_on_connection','update_updated_at_column','mark_messages_read')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;
END $$;

-- 3. Trigger-only SECURITY DEFINER functions must not be RPC-callable.
--    Revoke from PUBLIC (anon/authenticated inherit EXECUTE from PUBLIC).
REVOKE EXECUTE ON FUNCTION public.apply_signup_membership_benefit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_connection() FROM PUBLIC;

-- 4. Stop public storage buckets from being listable/enumerable (serving via
--    getPublicUrl is unaffected). Folder-scoped + upload policies are kept.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads 1io9m69_0" ON storage.objects;
DROP POLICY IF EXISTS "Allow Audio Uploads pm4q44_0" ON storage.objects;

-- 5. Disable the GraphQL API entirely (app uses REST only). Clears ~44 GraphQL
--    schema-exposure advisories. Reversible: CREATE EXTENSION pg_graphql;
DROP EXTENSION IF EXISTS pg_graphql;

-- 6. Endorsements: only the rate-limited /api/vouch route (service role) may
--    insert. Block direct client inserts; keep public SELECT + owner DELETE.
DROP POLICY IF EXISTS "Anyone can add endorsements" ON public.endorsements;
DROP POLICY IF EXISTS "Anyone can create endorsement" ON public.endorsements;
