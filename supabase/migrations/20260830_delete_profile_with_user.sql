-- Deleting an auth user leaves the profile row behind.
--
-- Caught by a throwaway user in dev: the account went, the profile stayed —
-- name, gothra, bio and all. profiles has no foreign key to auth.users at all
-- (it is one of the tables no migration ever created), while every sibling
-- table cascades properly.
--
-- Two reasons it matters: a member who asks to be deleted is not deleted, which
-- is a right-to-erasure problem under GDPR and India's DPDP Act; and the orphan
-- still gets counted and emailed.
--
-- A trigger rather than a foreign key, deliberately. Adding
--   references auth.users(id) on delete cascade
-- requires every existing row to have a matching user, and dev holds 150 seeded
-- profiles with no auth account. The constraint would refuse to be created
-- until those were deleted, which would destroy the matching test data. A
-- trigger achieves the same deletion without holding the whole table hostage to
-- rows that are deliberately synthetic.

create or replace function public.delete_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.profiles where id = old.id;
  return old;
exception
  when others then
    -- Never block account deletion. A profile that survives is the situation
    -- we already have; an account that cannot be deleted would be worse.
    raise warning 'delete_profile_for_user failed for %: %', old.id, sqlerrm;
    return old;
end;
$$;

drop trigger if exists trg_delete_profile_for_user on auth.users;
create trigger trg_delete_profile_for_user
after delete on auth.users
for each row
execute function public.delete_profile_for_user();
