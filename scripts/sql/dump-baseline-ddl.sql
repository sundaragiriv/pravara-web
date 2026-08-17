-- ============================================================
-- Emit the public schema as DDL, from the database itself.
--
-- Why this exists: the repository cannot rebuild the database. `profiles`
-- — the central table of the product — is created by no migration, nor are
-- `connections`, `notifications` or `photo_access`. The schema was built by
-- hand in the SQL editor over time, so the two live databases are not a
-- copy of the truth, they ARE the truth.
--
-- SIX SEPARATE QUERIES. Run them one at a time and download each CSV.
--
-- An earlier version did all of this as one nine-branch UNION and failed
-- with `relation "public" does not exist`, which is not a diagnosable error
-- from a query that size. Six small queries fail one at a time and say
-- which, and every expression is cast to text explicitly so nothing depends
-- on how Postgres resolves `name` against `text` across union branches.
--
-- For each one: run it, then "Download CSV" — do not copy from the grid,
-- which truncates long cells. Name the files 1.csv through 6.csv.
--
-- All read-only. Nothing here creates or changes anything.
-- ============================================================


-- ── 1 of 6 · TABLES ─────────────────────────────────────────────────────────
-- Run this on its own, download as 1.csv, then move to the next.

SELECT
  2::int                       AS part,
  'table'::text                AS kind,
  c.relname::text              AS name,
  (
    'CREATE TABLE IF NOT EXISTS public.' || quote_ident(c.relname::text) || E' (\n'
    || string_agg(
         '  ' || quote_ident(a.attname::text)
         || ' ' || format_type(a.atttypid, a.atttypmod)
         || COALESCE(' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid), '')
         || CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END,
         E',\n' ORDER BY a.attnum
       )
    || E'\n);'
  )::text                      AS ddl
FROM pg_class c
JOIN pg_namespace n     ON n.oid = c.relnamespace
JOIN pg_attribute a     ON a.attrelid = c.oid
LEFT JOIN pg_attrdef ad ON ad.adrelid = c.oid AND ad.adnum = a.attnum
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND a.attnum > 0
  AND NOT a.attisdropped
GROUP BY c.relname
ORDER BY c.relname;


-- ── 2 of 6 · KEYS AND CHECKS ────────────────────────────────────────────────
-- Primary keys, unique and check constraints. Download as 2.csv.
--
-- Separate from foreign keys on purpose: these can be applied as soon as
-- their own table exists, foreign keys cannot.

SELECT
  3::int          AS part,
  'constraint'::text AS kind,
  con.conname::text  AS name,
  ('ALTER TABLE public.' || quote_ident(rel.relname::text)
   || ' ADD CONSTRAINT ' || quote_ident(con.conname::text)
   || ' ' || pg_get_constraintdef(con.oid) || ';')::text AS ddl
FROM pg_constraint con
JOIN pg_class rel     ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND con.contype IN ('p', 'u', 'c')
ORDER BY rel.relname, con.conname;


-- ── 3 of 6 · FOREIGN KEYS ───────────────────────────────────────────────────
-- Applied last among the structural parts, once every table exists.
-- Download as 3.csv.

SELECT
  4::int             AS part,
  'foreign key'::text AS kind,
  con.conname::text   AS name,
  ('ALTER TABLE public.' || quote_ident(rel.relname::text)
   || ' ADD CONSTRAINT ' || quote_ident(con.conname::text)
   || ' ' || pg_get_constraintdef(con.oid) || ';')::text AS ddl
FROM pg_constraint con
JOIN pg_class rel     ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND con.contype = 'f'
ORDER BY rel.relname, con.conname;


-- ── 4 of 6 · INDEXES ────────────────────────────────────────────────────────
-- Only those not already implied by a constraint above. Download as 4.csv.

SELECT
  5::int          AS part,
  'index'::text   AS kind,
  i.indexname::text AS name,
  (i.indexdef || ';')::text AS ddl
FROM pg_indexes i
WHERE i.schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint c2
    JOIN pg_class ic ON ic.oid = c2.conindid
    WHERE ic.relname = i.indexname
  )
ORDER BY i.tablename, i.indexname;


-- ── 5 of 6 · FUNCTIONS AND TRIGGERS ─────────────────────────────────────────
-- Includes the SECURITY DEFINER helpers the policies depend on, which is
-- why this must land before the policies. Download as 5.csv.
--
-- Extension-owned objects are excluded — CREATE EXTENSION recreates those,
-- and without the filter pgcrypto and pg_graphql would bury everything else.

SELECT
  6::int           AS part,
  'function'::text AS kind,
  p.proname::text  AS name,
  (pg_get_functiondef(p.oid) || ';')::text AS ddl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e'
  )

UNION ALL

SELECT
  7::int          AS part,
  'trigger'::text AS kind,
  t.tgname::text  AS name,
  (pg_get_triggerdef(t.oid) || ';')::text AS ddl
FROM pg_trigger t
JOIN pg_class rel     ON rel.oid = t.tgrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND NOT t.tgisinternal

ORDER BY 1, 3;


-- ── 6 of 6 · ROW LEVEL SECURITY AND POLICIES ────────────────────────────────
-- The part that exists in no migration at all, and the part that has
-- already gone wrong twice. Download as 6.csv.

SELECT
  8::int        AS part,
  'rls'::text   AS kind,
  c.relname::text AS name,
  ('ALTER TABLE public.' || quote_ident(c.relname::text)
   || ' ENABLE ROW LEVEL SECURITY;')::text AS ddl
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity

UNION ALL

SELECT
  9::int           AS part,
  'policy'::text   AS kind,
  pol.policyname::text AS name,
  (
    'CREATE POLICY ' || quote_ident(pol.policyname::text)
    || ' ON public.' || quote_ident(pol.tablename::text)
    || ' AS ' || pol.permissive
    || ' FOR ' || pol.cmd
    || ' TO ' || array_to_string(pol.roles, ', ')
    || COALESCE(E'\n  USING (' || pol.qual || ')', '')
    || COALESCE(E'\n  WITH CHECK (' || pol.with_check || ')', '')
    || ';'
  )::text AS ddl
FROM pg_policies pol
WHERE pol.schemaname = 'public'

ORDER BY 1, 3;
