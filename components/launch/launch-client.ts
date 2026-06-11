"use client";

export function getLaunchSessionId(): string {
  const storageKey = "pravara-launch-session";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `launch-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(storageKey, sessionId);
  return sessionId;
}

export function trackLaunchEvent(event: {
  event: "launch_home_view" | "launch_register_view" | "launch_register_click" | "launch_registration_completed";
  path: string;
  source?: string;
}) {
  const sessionId = getLaunchSessionId();
  const payload = JSON.stringify({
    ...event,
    session_id: sessionId,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/launch-analytics", blob);
    return;
  }

  void fetch("/api/launch-analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}
