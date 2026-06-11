"use client";

import { useEffect } from "react";

import { trackLaunchEvent } from "./launch-client";

type LaunchPageViewProps = {
  path: "/" | "/register";
  event: "launch_home_view" | "launch_register_view";
};

export default function LaunchPageView({ path, event }: LaunchPageViewProps) {
  useEffect(() => {
    const key = `pravara-pageview:${event}:${path}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    trackLaunchEvent({ event, path });
  }, [event, path]);

  return null;
}
