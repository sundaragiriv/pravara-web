-- A ledger of every sequence email sent, and the thing that makes the sequence
-- safe to run on a cron.
--
-- The milestone emails go to the whole cohort the first time a threshold is
-- crossed, and the premium emails go to one member on one day. Both run from a
-- job that can be retried, redeployed mid-run, or fire twice in a day, so
-- "have we already sent this to this address" has to be a fact in the database
-- rather than something inferred from timestamps.
--
-- The unique index is the mechanism, not the audit trail: an insert that
-- conflicts is a send that must not happen. Insert BEFORE sending and let the
-- conflict decide, so a crash between the send and the write cannot produce a
-- second copy.

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  template_key text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  registration_id uuid references public.launch_registrations(id) on delete set null,
  sent_at timestamptz not null default now(),
  -- What the copy claimed at send time: the count, the seats left, the tier.
  -- Cheap to write and the only way to answer "what did we actually tell them"
  -- once the numbers have moved on.
  meta jsonb
);

-- One of each template per address, forever.
create unique index if not exists email_sends_once
  on public.email_sends (email, template_key);

create index if not exists email_sends_template_sent_at
  on public.email_sends (template_key, sent_at desc);

alter table public.email_sends enable row level security;

-- No policy for ordinary members: this is operational data about them, not for
-- them, and nothing in the app reads it as a signed-in user. The cron uses the
-- service role, which bypasses RLS. Admins get an explicit read policy through
-- the same SECURITY DEFINER helper the rest of the schema uses, so that adding
-- it here cannot reintroduce the recursion that took profile reads to 500.
drop policy if exists "email_sends admin read" on public.email_sends;
create policy "email_sends admin read"
  on public.email_sends for select
  to authenticated
  using (public.is_admin());
