// Client-side Sentry, loaded off the critical path.
//
// Measured on a throttled mobile profile, the Sentry client chunk was 131KB
// transferred / 420KB parsed and ~2.1s of JS bootup — the single largest
// script cost on the landing page, on a page whose whole job is to convert a
// cold visitor in the first few seconds.
//
// So it is imported dynamically once the browser goes idle rather than during
// hydration. The tradeoff is a window at the start of the page where the SDK
// is not listening yet, which is exactly when the errors that matter most
// (hydration failures, a broken first render) happen. To avoid trading
// performance for blindness, native error listeners are installed
// synchronously below and anything they catch is replayed into Sentry the
// moment it loads.

import type * as SentryModule from "@sentry/nextjs";

const SENTRY_DSN =
  "https://8a2ae9a0d4a19dd5b63b13fb9139d265@o4510932477083648.ingest.us.sentry.io/4510932479442944";

/**
 * Deliberately long. requestIdleCallback fires at this timeout whether or not
 * the browser is actually idle, and with the atmosphere animating it never is.
 * At 3s it landed inside the LCP window and pushed mobile LCP 872ms -> 1380ms.
 * Past 10s the page has settled and only FCP benefits remain.
 */
const IDLE_TIMEOUT_MS = 10000;

/**
 * Fraction of sessions that load the SDK without waiting for something to go
 * wrong. Everything else loads it only if an error is actually caught.
 *
 * Deferring to idle stopped Sentry blocking first paint, but it did not stop it
 * costing anything: parsing and initialising 382KB is a single long task, and on
 * a phone at 4x CPU throttle that measured 1183ms of the page's 2682ms total
 * blocking time. Blocking the chunk outright took TBT to 1499ms. So on a mid-
 * range phone, roughly a second of unresponsiveness was being spent, in every
 * session, on a library that in most sessions has nothing to report.
 *
 * The native error listeners below already catch and buffer everything from the
 * first moment of the page, and the buffer is replayed the instant the SDK
 * arrives — so error reporting is not what is being traded away here. What
 * needs the SDK loaded regardless is performance tracing, which is sampled
 * anyway. Sampling the decision at the session level instead of the transaction
 * level gives the same coverage: these sessions trace fully, the rest do not
 * trace at all, and 1 in 10 is what tracesSampleRate: 0.1 was already asking for.
 */
const TRACE_SESSION_RATE = 0.1;
const tracedSession = Math.random() < TRACE_SESSION_RATE;
/** Enough to capture a broken first render; small enough to never be a leak. */
const MAX_BUFFERED_ERRORS = 12;

let sentry: typeof SentryModule | null = null;
let loading: Promise<void> | null = null;
const buffered: unknown[] = [];

function bufferError(error: unknown) {
  if (sentry) {
    sentry.captureException(error);
    return;
  }
  if (buffered.length < MAX_BUFFERED_ERRORS) buffered.push(error);
  // An error is the reason this session needs the SDK. Load it now rather than
  // waiting for an idle callback that may be a long way off, or may already
  // have decided not to load it at all.
  void loadSentry();
}

function onWindowError(event: ErrorEvent) {
  bufferError(event.error ?? event.message);
}

function onUnhandledRejection(event: PromiseRejectionEvent) {
  bufferError(event.reason);
}

function loadSentry(): Promise<void> {
  if (loading) return loading;

  loading = (async () => {
    const Sentry = await import("@sentry/nextjs");

    Sentry.init({
      dsn: SENTRY_DSN,

      // The session was already sampled at load time, so this is all-or-nothing
      // rather than 0.1 — sampling twice would trace 1 session in 100, not 1
      // in 10. Sessions that loaded the SDK because something broke report the
      // error and trace nothing.
      tracesSampleRate: tracedSession ? 1 : 0,

      // Pravara handles sensitive matrimonial data — never attach IPs or emails to error reports.
      sendDefaultPii: false,
    });

    sentry = Sentry;

    // Replay anything that broke before the SDK was listening.
    for (const error of buffered.splice(0)) {
      Sentry.captureException(error);
    }

    // Sentry's own global handlers are live now; ours would double-report.
    window.removeEventListener("error", onWindowError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  })();

  return loading;
}

if (typeof window !== "undefined") {
  window.addEventListener("error", onWindowError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  // Only the sampled sessions pay for the SDK up front. The rest load it if and
  // when bufferError decides they need it.
  if (tracedSession) {
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      idle(() => void loadSentry(), { timeout: IDLE_TIMEOUT_MS });
    } else {
      window.setTimeout(() => void loadSentry(), IDLE_TIMEOUT_MS);
    }
  }
}

/**
 * Next calls this on every client-side route change. It has to exist
 * synchronously at module load, so it forwards to Sentry only once the SDK is
 * present — transitions before that are simply not traced.
 */
export function onRouterTransitionStart(
  ...args: Parameters<typeof SentryModule.captureRouterTransitionStart>
) {
  sentry?.captureRouterTransitionStart?.(...args);
}
