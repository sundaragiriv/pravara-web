-- Track founder-profile reminder emails so the cron doesn't re-spam.
ALTER TABLE public.launch_registrations
  ADD COLUMN IF NOT EXISTS reminders_sent INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;
