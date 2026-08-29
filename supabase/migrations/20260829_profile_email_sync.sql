-- profiles.email exists on every row and is filled on none of them.
--
-- Production has three profiles and zero addresses. The reason is visible in
-- add_membership_benefits.sql: the trigger that creates the profile row on
-- signup stamps the name, the tier and the founding flag, and never touches
-- email. Nothing else in the application writes it either, so the column has
-- been decorative since it was added.
--
-- That matters now because the founding-premium emails read it. Both of them
-- skip a member whose address is null, which in production is all of them —
-- the sequence would have sent nothing and reported success.
--
-- Two parts: backfill what is already there, then keep it true.

-- 1. Backfill from the source of truth.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

-- 2. Keep it in step, on signup and on any later address change.
--
-- UPDATE rather than upsert: profiles has NOT NULL columns this trigger has no
-- business inventing values for, and the row is already created by
-- trg_apply_signup_membership_benefit. Postgres fires same-event triggers in
-- alphabetical order, and trg_apply_... sorts before trg_sync_..., so the row
-- exists by the time this runs. If it somehow does not, the next address
-- change or a re-run of the backfill above will catch it — which is the right
-- failure mode for something that must never block a signup.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
exception
  when others then
    -- Never block account creation or an email change over this.
    raise warning 'sync_profile_email failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists trg_sync_profile_email on auth.users;
create trigger trg_sync_profile_email
after insert or update of email on auth.users
for each row
execute function public.sync_profile_email();
