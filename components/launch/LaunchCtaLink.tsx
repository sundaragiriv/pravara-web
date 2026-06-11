"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

import { trackLaunchEvent } from "./launch-client";

type LaunchCtaLinkProps = LinkProps & {
  source: string;
  className?: string;
  children: ReactNode;
};

export default function LaunchCtaLink({
  href,
  source,
  className,
  children,
  ...rest
}: LaunchCtaLinkProps) {
  return (
    <Link
      {...rest}
      href={href}
      className={className}
      onClick={() => {
        trackLaunchEvent({
          event: "launch_register_click",
          path: typeof window !== "undefined" ? window.location.pathname : "/",
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}
