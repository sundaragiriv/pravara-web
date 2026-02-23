// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8a2ae9a0d4a19dd5b63b13fb9139d265@o4510932477083648.ingest.us.sentry.io/4510932479442944",

  // Sample 10% of traces in production to preserve quota. Raise to 1.0 only during debugging.
  tracesSampleRate: 0.1,

  // Pravara handles sensitive matrimonial data — never attach IPs or emails to error reports.
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
