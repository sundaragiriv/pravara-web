-- Registration now asks for first and last name separately, a date of birth
-- instead of an age, and a state and city alongside the country.
--
-- full_name and age are KEPT and kept populated, derived server-side. They are
-- read by the welcome email, the profile prefill trigger, the admin tables and
-- the matching engine, and quietly dropping them to add two new columns would
-- break all of it for no gain. age in particular is NOT NULL.
--
-- Date of birth rather than age because age is a fact with a shelf life. A row
-- stating "29" is wrong within a year and there is no way to tell from the row
-- when it was true. A date of birth is correct forever, and age derives from it
-- on demand — which is also what the Vedic side needs, since a horoscope cannot
-- be cast from an integer.

alter table public.launch_registrations
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists dob        date,
  -- Subdivision code (ISO 3166-2 without the country prefix) for the three
  -- served markets, free text elsewhere. See lib/regions.ts.
  add column if not exists state      text,
  add column if not exists city       text;

-- Split the three existing rows so nothing is left half-migrated. Everything
-- before the last space is the given name; this is deliberately simple, and
-- for the handful of rows that exist it is also correct.
update public.launch_registrations
set
  first_name = coalesce(first_name, nullif(split_part(full_name, ' ', 1), '')),
  last_name  = coalesce(
    last_name,
    nullif(trim(substring(full_name from position(' ' in full_name) + 1)), '')
  )
where full_name is not null
  and (first_name is null or last_name is null);

-- Nothing backfills dob: it cannot be recovered from an age, and inventing a
-- birthday for a matrimonial profile would be worse than leaving it null.

create index if not exists launch_registrations_state_idx
  on public.launch_registrations (country, state);
