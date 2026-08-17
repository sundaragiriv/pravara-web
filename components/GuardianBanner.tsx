"use client";

import { Users, ChevronDown } from "lucide-react";

import type { CollaboratorPermissions } from "@/utils/collaborator-permissions";

/**
 * Says whose profile you are acting on.
 *
 * The dashboard already computed a `roleLabel` and then never rendered it — the
 * line was explicitly marked unused. So a parent browsing matches saw exactly
 * what they would see on their own account, and an interest sent from that
 * screen went out in their daughter's name with nothing on the page to say so.
 *
 * Also the switcher. Being someone's guardian previously replaced your own
 * dashboard permanently: there was no way back to your own matches, and a
 * parent helping two children could only ever see one of them.
 */

export type Collaboration = {
  userId: string;
  name: string;
  role: string;
};

export default function GuardianBanner({
  collaborations,
  viewingAs,
  ownId,
  ownName,
  permissions,
  onSwitch,
}: {
  collaborations: Collaboration[];
  viewingAs: string | null;
  ownId: string;
  ownName: string;
  permissions: CollaboratorPermissions;
  onSwitch: (userId: string) => void;
}) {
  if (collaborations.length === 0) return null;

  const active = collaborations.find((c) => c.userId === viewingAs);
  const onOwnProfile = viewingAs === ownId;

  const withheld = [
    !permissions.sendInterest && "send interest",
    !permissions.editProfile && "edit the profile",
    !permissions.chat && "read messages",
  ].filter(Boolean) as string[];

  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 ${
        onOwnProfile
          ? "border-stone-800 bg-stone-900/40"
          : "border-haldi-500/35 bg-haldi-900/15"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Users size={15} className={onOwnProfile ? "text-stone-500" : "text-haldi-400"} />
          <p className="text-xs text-stone-300">
            {onOwnProfile ? (
              <>Viewing <strong className="text-stone-100">your own</strong> matches.</>
            ) : (
              <>
                Acting for{" "}
                <strong className="text-haldi-300">{active?.name ?? "another member"}</strong>
                {active?.role && <span className="text-stone-500"> · {active.role}</span>}
              </>
            )}
          </p>
        </div>

        <div className="relative">
          <select
            value={viewingAs ?? ownId}
            onChange={(e) => onSwitch(e.target.value)}
            aria-label="Whose profile to act on"
            className="appearance-none rounded-lg border border-stone-700 bg-stone-950 py-1.5 pl-3 pr-8 text-xs text-stone-300 outline-none transition-colors focus:border-haldi-500"
          >
            <option value={ownId}>{ownName || "My profile"}</option>
            {collaborations.map((c) => (
              <option key={c.userId} value={c.userId}>
                {c.name} ({c.role})
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500"
          />
        </div>
      </div>

      {/* What this role cannot do, stated up front rather than discovered when a
          button does nothing. */}
      {!onOwnProfile && withheld.length > 0 && (
        <p className="mt-2 border-t border-haldi-500/15 pt-2 text-[10px] leading-relaxed text-stone-500">
          As {active?.role ?? "a guardian"} you can browse and shortlist, but not{" "}
          {withheld.length === 1
            ? withheld[0]
            : `${withheld.slice(0, -1).join(", ")} or ${withheld[withheld.length - 1]}`}
          .
        </p>
      )}
    </div>
  );
}
