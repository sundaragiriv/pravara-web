CREATE TABLE IF NOT EXISTS public.launch_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL CHECK (
    event_name IN (
      'launch_home_view',
      'launch_register_view',
      'launch_register_click',
      'launch_registration_completed'
    )
  ),
  path TEXT NOT NULL,
  source TEXT,
  session_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launch_analytics_events_name_created
  ON public.launch_analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_launch_analytics_events_session
  ON public.launch_analytics_events (session_id);

ALTER TABLE public.launch_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_manage_launch_analytics_events" ON public.launch_analytics_events;
CREATE POLICY "service_role_manage_launch_analytics_events"
  ON public.launch_analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
