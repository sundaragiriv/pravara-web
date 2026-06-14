"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";

export interface Registrant {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  profession: string | null;
  location: string | null;
  status: string | null;
  source: string | null;
  reminders_sent: number | null;
  created_at: string;
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ status }: { status: string | null }) {
  const invited = status === "invited";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
        invited
          ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
          : "border-stone-700 bg-stone-800 text-stone-400"
      }`}
    >
      {invited ? "Account" : "Lead"}
    </span>
  );
}

export default function RegistrantsTable({ registrants }: { registrants: Registrant[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "registered" | "invited">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrants.filter((r) => {
      const matchesQuery =
        !q ||
        r.full_name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.location?.toLowerCase().includes(q);
      const matchesStatus = status === "all" || (r.status ?? "registered") === status;
      return matchesQuery && matchesStatus;
    });
  }, [registrants, query, status]);

  const exportCSV = () => {
    const header = ["Name", "Email", "Phone", "Gender", "Age", "Profession", "Location", "Status", "Source", "Reminders", "Registered"];
    const rows = filtered.map((r) => [
      r.full_name ?? "",
      r.email ?? "",
      r.phone ?? "",
      r.gender ?? "",
      r.age != null ? String(r.age) : "",
      r.profession ?? "",
      r.location ?? "",
      r.status ?? "registered",
      r.source ?? "",
      r.reminders_sent != null ? String(r.reminders_sent) : "0",
      fmt(r.created_at),
    ]);
    // Escape quotes per RFC 4180 so commas/quotes in fields don't break columns.
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `pravara_registrants_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, city…"
            className="w-full rounded-lg border border-stone-800 bg-stone-900 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder-stone-600 focus:border-haldi-600 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Filter by status"
          className="rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-300 focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="registered">Leads (no account)</option>
          <option value="invited">Created account</option>
        </select>
        <button
          type="button"
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-400 transition-colors hover:text-stone-200 disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
        <span className="text-sm text-stone-600">{filtered.length} registrants</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/60 text-left text-xs uppercase tracking-wider text-stone-400">
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 md:table-cell">Contact</th>
                <th className="px-4 py-3">Gender / Age</th>
                <th className="hidden px-4 py-3 lg:table-cell">Profession</th>
                <th className="hidden px-4 py-3 lg:table-cell">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-stone-800/50 transition-colors hover:bg-stone-900/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-200">
                      {r.full_name || <span className="italic text-stone-600">No name</span>}
                    </div>
                    <div className="text-xs text-stone-500 md:hidden">{r.email}</div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="text-stone-300">{r.email}</div>
                    <div className="text-xs text-stone-500">{r.phone || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-400">
                    {[r.gender, r.age != null ? `${r.age}` : null].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-stone-400 lg:table-cell">{r.profession || "—"}</td>
                  <td className="hidden px-4 py-3 text-xs text-stone-400 lg:table-cell">{r.location || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="hidden px-4 py-3 text-xs text-stone-500 sm:table-cell">{fmt(r.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-600">
                    {registrants.length === 0
                      ? "No registrants yet. They'll appear here as founders reserve their seat."
                      : "No registrants match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
