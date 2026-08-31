-- Unsubscribe, and the suppression list that makes it mean something.
--
-- Pravara sends mail nobody asked for in the strict sense — the founding-circle
-- milestones, the profile nudges. That is marketing, and marketing needs a way
-- out. Two reasons, and the second is the one that bites:
--
--   Legally, CAN-SPAM requires a working opt-out on commercial email, and the
--   GDPR and India's DPDP Act require consent that can be withdrawn.
--
--   Practically, Gmail and Yahoo have required one-click unsubscribe from bulk
--   senders since February 2024 and hold senders to a spam-complaint rate under
--   0.3%. Without an unsubscribe link, a reader who wants out has exactly one
--   button — "Report spam" — and that reputation damage lands on every message
--   from the domain, password resets included.
--
-- Keyed by address rather than by profile or registration, deliberately. The
-- same person may be a lead and a member, and "stop emailing me" applies to the
-- address, not to whichever row we happen to look them up by.

create table if not exists public.email_preferences (
  email text primary key,
  -- The unsubscribe link carries this and nothing else. Random and unguessable,
  -- so no signature or shared secret is needed to verify it, and it reveals no
  -- address if the URL is logged or shared.
  token uuid not null default gen_random_uuid(),
  -- Null means subscribed. A timestamp rather than a boolean because the date
  -- someone opted out is the fact you need in a complaint.
  unsubscribed_at timestamptz,
  -- Where it came from: the footer link, a one-click header, or by hand.
  unsubscribed_via text,
  created_at timestamptz not null default now()
);

create unique index if not exists email_preferences_token
  on public.email_preferences (token);

create index if not exists email_preferences_unsubscribed
  on public.email_preferences (unsubscribed_at)
  where unsubscribed_at is not null;

alter table public.email_preferences enable row level security;

-- No policy for members: the unsubscribe page is anonymous and works through a
-- server route holding the service role, which bypasses RLS. Nothing in the
-- signed-in app reads this table, so there is no policy to write and every
-- direct client read is refused.
--
-- Admins can see who has opted out, through the same SECURITY DEFINER helper
-- the rest of the schema uses.
drop policy if exists "email_preferences admin read" on public.email_preferences;
create policy "email_preferences admin read"
  on public.email_preferences for select
  to authenticated
  using (public.is_admin());
