import { NextRequest, NextResponse } from "next/server";

import { unsubscribeByToken } from "@/lib/email-preferences";

export const dynamic = "force-dynamic";

/**
 * The one-click unsubscribe endpoint.
 *
 * This URL is what goes in the List-Unsubscribe header, and RFC 8058 says a
 * mail client that also sees List-Unsubscribe-Post will POST here when the
 * reader presses its built-in Unsubscribe button. The confirmation page at
 * /unsubscribe/<token> posts to the same place.
 *
 * It is a separate path from that page for a plain reason — Next cannot serve a
 * page and a route handler from one route — but the split is the right shape
 * anyway: this endpoint acts, the page only asks.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const result = await unsubscribeByToken(token, "one-click");

  if (!result.ok) {
    return NextResponse.json({ error: "Unknown unsubscribe link" }, { status: 404 });
  }

  // A browser submitting the form wants to land somewhere; a mail client doing
  // RFC 8058 wants a 200 and no ceremony.
  if ((req.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL(`/unsubscribe/${token}?done=1`, req.url), 303);
  }

  return NextResponse.json({ ok: true, alreadyDone: result.alreadyDone ?? false });
}

/**
 * Some older clients still GET the List-Unsubscribe URL. That must not opt
 * anyone out — scanners and security gateways fetch links in mail — so it
 * hands the reader to the page that asks first.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  return NextResponse.redirect(new URL(`/unsubscribe/${token}`, req.url), 302);
}
