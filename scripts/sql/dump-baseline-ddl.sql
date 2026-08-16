-- ============================================================
-- Emit the whole public schema as DDL, from the database itself.
--
-- Why this exists: the repository cannot rebuild the database. `profiles`
-- — the central table of the product — is created by no migration, nor are
-- `connections`, `notifications` or `photo_access`. The schema was built by
-- hand in the SQL editor over time, so the two live databases are not a
-- copy of the truth, they ARE the truth. That is a single point of failure,
-- and it has already cost two migrations written against columns that exist
-- only in old migration files.
--
-- HOW TO USE
--   1. Run this against PRODUCTION.
--   2. Use "Download CSV" on the results — do not copy from the grid, which
--      truncates long cells.
--   3. Hand the file back; it becomes supabase/migrations/000_baseline.sql
--
-- Read-only. Creates nothing, changes nothing.
--
-- Output is one statement per row, with a `part` column that orders a
-- replay from empty: extensions, tables, then keys, then indexes, then
-- functions, triggers, and RLS last. Foreign keys are separated from the
-- CREATE TABLE statements deliberately, so every table exists before
-- anything references it.
-- ============================================================

WITH cols AS (
  SELECT
    c.relname AS table_name,
    string_agg(
      format(
        '  %I %s%s%s',
        a.attname,
        format_type(a.atttypid, a.atttypmod),
        CASE WHEN ad.adbin IS NOT NULL
             THEN ' DEFAULT ' || pg_get_expr(ad.adbin, ad.adrelid)
             ELSE '' END,
        CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END
      ),
      E',\n' ORDER BY a.attnum
    ) AS column_list
  FROM pg_class c
  JOIN pg_namespace n     ON n.oid = c.relnamespace
  JOIN pg_attribute a     ON a.attrelid = c.oid
  LEFT JOIN pg_attrdef ad ON ad.adrelid = c.oid AND ad.adnum = a.attnum
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND a.attnum > 0
    AND NOT a.attisdropped
  GROUP BY c.relname
),

-- Anything owned by an installed extension is recreated by CREATE EXTENSION,
-- not by us. Without this the dump would carry hundreds of pgcrypto and
-- pg_graphql definitions and drown the parts that matter.
ext_objects AS (
  SELECT objid FROM pg_depend WHERE deptype = 'e'
),

parts AS (
  SELECT 1 AS part, 'extension'::text AS kind, 'pgcrypto'::text AS name,
         'CREATE EXTENSION IF NOT EXISTS pgcrypto;'::text AS ddl

  UNION ALL
  SELECT 2, 'table', table_name,
         format(E'CREATE TABLE IF NOT EXISTS public.%I (\n%s\n);', table_name, column_list)
  FROM cols

  UNION ALL
  SELECT 3, 'constraint', con.conname,
         format('ALTER TABLE public.%I ADD CONSTRAINT %I %s;',
                rel.relname, con.conname, pg_get_constraintdef(con.oid))
  FROM pg_constraint con
  JOIN pg_class rel     ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public' AND con.contype IN ('p', 'u', 'c')

  UNION ALL
  SELECT 4, 'foreign key', con.conname,
         format('ALTER TABLE public.%I ADD CONSTRAINT %I %s;',
                rel.relname, con.conname, pg_get_constraintdef(con.oid))
  FROM pg_constraint con
  JOIN pg_class rel     ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public' AND con.contype = 'f'

  UNION ALL
  SELECT 5, 'index', i.indexname, i.indexdef || ';'
  FROM pg_indexes i
  WHERE i.schemaname = 'public'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint c2
      JOIN pg_class ic ON ic.oid = c2.conindid
      WHERE ic.relname = i.indexname
    )

  UNION ALL
  SELECT 6, 'function', p.proname, pg_get_functiondef(p.oid) || ';'
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND p.oid NOT IN (SELECT objid FROM ext_objects)

  UNION ALL
  SELECT 7, 'trigger', t.tgname, pg_get_triggerdef(t.oid) || ';'
  FROM pg_trigger t
  JOIN pg_class rel     ON rel.oid = t.tgrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND NOT t.tgisinternal
    AND t.oid NOT IN (SELECT objid FROM ext_objects)

  UNION ALL
  SELECT 8, 'rls', c.relname,
         format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', c.relname)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity

  -- The policies. This is the part that exists in no migration at all, and
  -- the part that has already gone wrong twice.
  UNION ALL
  SELECT 9, 'policy', pol.policyname,
         format(
           'CREATE POLICY %I ON public.%I AS %s FOR %s TO %s%s%s;',
           pol.policyname,
           pol.tablename,
           pol.permissive,
           pol.cmd,
           array_to_string(pol.roles, ', '),
           CASE WHEN pol.qual IS NOT NULL       THEN E'\n  USING (' || pol.qual || ')' ELSE '' END,
           CASE WHEN pol.with_check IS NOT NULL THEN E'\n  WITH CHECK (' || pol.with_check || ')' ELSE '' END
         )
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
)

SELECT part, kind, name, ddl
FROM parts
ORDER BY part, name;
