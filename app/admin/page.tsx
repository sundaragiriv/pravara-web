"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users, Tag, BarChart2, ShieldCheck, Search, LogOut,
  Plus, Trash2, Lock, Unlock, RefreshCw, Download,
  CheckCircle, XCircle, AlertCircle, Crown, ChevronDown,
  Calendar, TrendingUp, UserCheck, UserX, Loader2, Eye,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────── Types */
type Tab = "users" | "verification" | "memberships" | "coupons" | "analytics";

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  membership_tier: string | null;
  is_admin: boolean;
  is_verified: boolean | null;
  is_active: boolean | null;
  created_at: string;
  avatar_url: string | null;
  community_id: number | null;
  nakshatra_id: number | null;
  gothra_id: number | null;
}

interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  tier_target: string | null;
  is_active: boolean;
  notes: string | null;
}

/* ─────────────────────────────────────────────────────────── Helpers */
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function TierBadge({ tier }: { tier: string | null }) {
  const t = tier || "Basic";
  const cls =
    t === "Concierge" ? "bg-purple-900/40 text-purple-300 border-purple-700" :
    t === "Gold"      ? "bg-haldi-900/40 text-haldi-300 border-haldi-700" :
                        "bg-stone-800 text-stone-400 border-stone-700";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {t === "Concierge" || t === "Gold" ? <Crown className="w-3 h-3" /> : null}
      {t}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════ Page */
export default function AdminPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [tab,          setTab]          = useState<Tab>("users");
  const [loading,      setLoading]      = useState(true);
  const [authorized,   setAuthorized]   = useState(false);
  const [adminName,    setAdminName]    = useState("");

  /* -- Users tab */
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [userSearch,   setUserSearch]   = useState("");
  const [tierFilter,   setTierFilter]   = useState<string>("all");
  const [actioningId,  setActioningId]  = useState<string | null>(null);

  /* -- Coupons tab */
  const [coupons,       setCoupons]      = useState<Coupon[]>([]);
  const [newCoupon,     setNewCoupon]    = useState({
    code: "", discount_pct: 10, max_uses: 50,
    valid_until: "", tier_target: "", notes: "",
  });
  const [savingCoupon,  setSavingCoupon] = useState(false);

  /* -- Analytics tab */
  const [analytics,    setAnalytics]    = useState({
    total: 0, basic: 0, gold: 0, concierge: 0,
    thisMonth: 0, verified: 0,
  });

  /* ── Auth guard ── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", user.id)
        .single();

      if (!data?.is_admin) {
        toast.error("Access denied. Admins only.");
        router.push("/dashboard");
        return;
      }
      setAdminName((data.full_name || "Admin").split(" ")[0]);
      setAuthorized(true);
      setLoading(false);
    })();
  }, []);

  /* ── Load data when tab changes ── */
  useEffect(() => {
    if (!authorized) return;
    if (tab === "users" || tab === "memberships" || tab === "verification") loadUsers();
    if (tab === "coupons")   loadCoupons();
    if (tab === "analytics") loadAnalytics();
  }, [authorized, tab]);

  /* ── Loaders ── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, membership_tier, is_admin, is_verified, is_active, created_at, avatar_url, community_id, nakshatra_id, gothra_id")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) { toast.error(error.message); }
    else setUsers(data as AdminUser[]);
    setLoading(false);
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); }
    else setCoupons(data as Coupon[]);
    setLoading(false);
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("membership_tier, is_verified, created_at");
    if (data) {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setAnalytics({
        total:      data.length,
        basic:      data.filter(r => !r.membership_tier || r.membership_tier === "Basic").length,
        gold:       data.filter(r => r.membership_tier === "Gold").length,
        concierge:  data.filter(r => r.membership_tier === "Concierge").length,
        thisMonth:  data.filter(r => new Date(r.created_at) >= start).length,
        verified:   data.filter(r => r.is_verified).length,
      });
    }
    setLoading(false);
  }, []);

  /* ── User actions ── */
  const toggleLock = async (u: AdminUser) => {
    setActioningId(u.id);
    const next = !u.is_active;
    const { error } = await supabase.from("profiles").update({ is_active: next }).eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(next ? `${u.full_name} unlocked.` : `${u.full_name} locked.`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: next } : x));
    }
    setActioningId(null);
  };

  const changeTier = async (u: AdminUser, tier: string) => {
    setActioningId(u.id);
    const { error } = await supabase.from("profiles").update({ membership_tier: tier }).eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${u.full_name} → ${tier}`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, membership_tier: tier } : x));
    }
    setActioningId(null);
  };

  const toggleVerify = async (u: AdminUser) => {
    setActioningId(u.id);
    const next = !u.is_verified;
    const { error } = await supabase.from("profiles").update({ is_verified: next }).eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(next ? `${u.full_name} verified.` : `Verification removed.`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_verified: next } : x));
    }
    setActioningId(null);
  };

  /* ── Coupon actions ── */
  const createCoupon = async () => {
    if (!newCoupon.code.trim()) { toast.error("Coupon code required"); return; }
    setSavingCoupon(true);
    const payload: any = {
      code:         newCoupon.code.trim().toUpperCase(),
      discount_pct: newCoupon.discount_pct,
      max_uses:     newCoupon.max_uses,
      tier_target:  newCoupon.tier_target || null,
      notes:        newCoupon.notes || null,
      valid_until:  newCoupon.valid_until ? new Date(newCoupon.valid_until).toISOString() : null,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(`Coupon ${payload.code} created.`);
      setNewCoupon({ code: "", discount_pct: 10, max_uses: 50, valid_until: "", tier_target: "", notes: "" });
      loadCoupons();
    }
    setSavingCoupon(false);
  };

  const expireCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").update({ is_active: false }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Coupon expired.");
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: false } : c));
    }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = filteredUsers.map(u => [
      u.full_name ?? "", u.email ?? "", u.phone ?? "",
      u.membership_tier ?? "Basic", u.is_verified ? "Yes" : "No",
      u.is_active === false ? "Locked" : "Active",
      formatDate(u.created_at),
    ]);
    const header = ["Name","Email","Phone","Tier","Verified","Status","Joined"];
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "pravara_users.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Filtered users ── */
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || (u.full_name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q)) || (u.phone?.includes(q));
    const matchTier   = tierFilter === "all" || (u.membership_tier || "Basic") === tierFilter;
    return matchSearch && matchTier;
  });

  /* ── Guards ── */
  if (!authorized && loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-stone-950/95 border-b border-stone-900 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" aria-label="Home">
            <Image src="/logo3.png" alt="Pravara" width={100} height={34}
              className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all" priority />
          </Link>

          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <ShieldCheck className="w-4 h-4 text-haldi-500" />
            <span className="hidden sm:inline">Admin Panel</span>
            <span className="text-stone-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-stone-300 font-medium">{adminName}</span>
          </div>

          <button
            type="button"
            onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
            className="flex items-center gap-2 text-stone-500 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Tab strip ── */}
      <div className="border-b border-stone-900 bg-stone-950">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {(["users","verification","memberships","coupons","analytics"] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? "border-haldi-500 text-haldi-400"
                  : "border-transparent text-stone-500 hover:text-stone-300"
              }`}
            >
              {t === "users"        && <Users      className="w-4 h-4" />}
              {t === "verification" && <ShieldCheck className="w-4 h-4" />}
              {t === "memberships"  && <Crown       className="w-4 h-4" />}
              {t === "coupons"      && <Tag         className="w-4 h-4" />}
              {t === "analytics"    && <BarChart2   className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
          </div>
        )}

        {/* ═══════════════════════════════════ USERS TAB */}
        {!loading && (tab === "users" || tab === "verification" || tab === "memberships") && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search name, email, phone…"
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-haldi-600"
                />
              </div>
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-haldi-600"
              >
                <option value="all">All Tiers</option>
                <option value="Basic">Basic</option>
                <option value="Gold">Gold</option>
                <option value="Concierge">Concierge</option>
              </select>
              <button
                type="button"
                onClick={loadUsers}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <span className="text-stone-600 text-sm">{filteredUsers.length} users</span>
            </div>

            {/* Table */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-900/60">
                      <th className="text-left px-4 py-3 text-stone-400 font-semibold">User</th>
                      <th className="text-left px-4 py-3 text-stone-400 font-semibold hidden md:table-cell">Contact</th>
                      <th className="text-left px-4 py-3 text-stone-400 font-semibold">Tier</th>
                      <th className="text-left px-4 py-3 text-stone-400 font-semibold hidden lg:table-cell">Joined</th>
                      {tab === "verification" && (
                        <th className="text-left px-4 py-3 text-stone-400 font-semibold">Varahi Shield</th>
                      )}
                      <th className="text-left px-4 py-3 text-stone-400 font-semibold">Status</th>
                      <th className="text-right px-4 py-3 text-stone-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-stone-800/50 hover:bg-stone-900/30 transition-colors">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-haldi-800 flex items-center justify-center text-stone-950 font-bold overflow-hidden flex-shrink-0">
                              {u.avatar_url
                                ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <span className="text-xs">{(u.full_name?.[0] ?? "?")}</span>
                              }
                            </div>
                            <div>
                              <div className="font-medium text-stone-200 flex items-center gap-1.5">
                                {u.full_name || "—"}
                                {u.is_admin && <span className="text-[9px] bg-haldi-900 text-haldi-400 px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>}
                              </div>
                              <div className="text-xs text-stone-500 font-mono">{u.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-stone-300 text-xs">{u.email || "—"}</div>
                          <div className="text-stone-500 text-xs">{u.phone || "—"}</div>
                        </td>

                        {/* Tier */}
                        <td className="px-4 py-3">
                          <TierBadge tier={u.membership_tier} />
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-stone-500 text-xs hidden lg:table-cell">
                          {formatDate(u.created_at)}
                        </td>

                        {/* Verification status (only on Verification tab) */}
                        {tab === "verification" && (
                          <td className="px-4 py-3">
                            {u.is_verified
                              ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                              : <span className="flex items-center gap-1 text-stone-500 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>
                            }
                          </td>
                        )}

                        {/* Status */}
                        <td className="px-4 py-3">
                          {u.is_active === false
                            ? <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><Lock className="w-3 h-3" /> Locked</span>
                            : <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><Unlock className="w-3 h-3" /> Active</span>
                          }
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {actioningId === u.id
                              ? <Loader2 className="w-4 h-4 animate-spin text-haldi-500" />
                              : <>
                                  {/* Lock / Unlock */}
                                  <ActionBtn
                                    title={u.is_active === false ? "Unlock account" : "Lock account"}
                                    onClick={() => toggleLock(u)}
                                    danger={u.is_active !== false}
                                  >
                                    {u.is_active === false ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </ActionBtn>

                                  {/* Verify / Unverify (all tabs) */}
                                  <ActionBtn
                                    title={u.is_verified ? "Remove verification" : "Mark verified (Varahi Shield)"}
                                    onClick={() => toggleVerify(u)}
                                    active={u.is_verified ?? false}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </ActionBtn>

                                  {/* Tier change (memberships tab) */}
                                  {tab === "memberships" && (
                                    <TierSelect current={u.membership_tier} onChange={t => changeTier(u, t)} />
                                  )}

                                  {/* View profile */}
                                  <ActionBtn title="View profile" onClick={() => router.push(`/profile/${u.id}`)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </ActionBtn>
                                </>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-stone-600">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════ COUPONS TAB */}
        {!loading && tab === "coupons" && (
          <div className="space-y-8">

            {/* Create coupon */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-stone-200 mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-haldi-500" /> Create Coupon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Code (auto-uppercased)">
                  <input
                    value={newCoupon.code}
                    onChange={e => setNewCoupon(n => ({ ...n, code: e.target.value }))}
                    placeholder="VEDIC20"
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Discount %">
                  <input
                    type="number" min={1} max={100}
                    value={newCoupon.discount_pct}
                    onChange={e => setNewCoupon(n => ({ ...n, discount_pct: +e.target.value }))}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Max Uses">
                  <input
                    type="number" min={1}
                    value={newCoupon.max_uses}
                    onChange={e => setNewCoupon(n => ({ ...n, max_uses: +e.target.value }))}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Valid Until (leave blank = no expiry)">
                  <input
                    type="date"
                    value={newCoupon.valid_until}
                    onChange={e => setNewCoupon(n => ({ ...n, valid_until: e.target.value }))}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Target Tier (optional)">
                  <select
                    value={newCoupon.tier_target}
                    onChange={e => setNewCoupon(n => ({ ...n, tier_target: e.target.value }))}
                    className={INPUT_CLS}
                  >
                    <option value="">Any</option>
                    <option value="Gold">Gold</option>
                    <option value="Concierge">Concierge</option>
                  </select>
                </Field>
                <Field label="Internal Notes">
                  <input
                    value={newCoupon.notes}
                    onChange={e => setNewCoupon(n => ({ ...n, notes: e.target.value }))}
                    placeholder="e.g. Founding batch"
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={createCoupon}
                disabled={savingCoupon}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Coupon
              </button>
            </div>

            {/* Existing coupons */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-200">All Coupons</h2>
                <span className="text-stone-500 text-sm">{coupons.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-900/60">
                      {["Code","Discount","Uses","Target Tier","Expires","Status",""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-stone-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} className="border-b border-stone-800/50 hover:bg-stone-900/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-haldi-300">{c.code}</td>
                        <td className="px-4 py-3 text-stone-200">{c.discount_pct}%</td>
                        <td className="px-4 py-3 text-stone-400">{c.used_count} / {c.max_uses}</td>
                        <td className="px-4 py-3">
                          {c.tier_target ? <TierBadge tier={c.tier_target} /> : <span className="text-stone-600">Any</span>}
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-xs">{c.valid_until ? formatDate(c.valid_until) : "Never"}</td>
                        <td className="px-4 py-3">
                          {c.is_active
                            ? <span className="text-emerald-400 text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                            : <span className="text-stone-600 text-xs flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Expired</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.is_active && (
                            <button
                              type="button"
                              onClick={() => expireCoupon(c.id)}
                              className="text-xs text-stone-500 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Expire
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-stone-600">No coupons yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════ ANALYTICS TAB */}
        {!loading && tab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Users",    value: analytics.total,     icon: Users,     color: "text-stone-200" },
                { label: "Basic",          value: analytics.basic,     icon: UserCheck, color: "text-stone-400" },
                { label: "Gold",           value: analytics.gold,      icon: Crown,     color: "text-haldi-400" },
                { label: "Concierge",      value: analytics.concierge, icon: Crown,     color: "text-purple-400" },
                { label: "This Month",     value: analytics.thisMonth, icon: Calendar,  color: "text-emerald-400" },
                { label: "Verified",       value: analytics.verified,  icon: ShieldCheck,color: "text-blue-400" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-stone-900/40 border border-stone-800 rounded-2xl p-5">
                  <div className={`flex items-center gap-2 mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className={`text-3xl font-bold ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Tier distribution bar */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Tier Distribution</h3>
              {analytics.total > 0 && (
                <div className="space-y-3">
                  {[
                    { tier: "Basic",     count: analytics.basic,     pct: Math.round(analytics.basic     / analytics.total * 100), cls: "bg-stone-600" },
                    { tier: "Gold",      count: analytics.gold,      pct: Math.round(analytics.gold      / analytics.total * 100), cls: "bg-haldi-600" },
                    { tier: "Concierge", count: analytics.concierge, pct: Math.round(analytics.concierge / analytics.total * 100), cls: "bg-purple-600" },
                  ].map(({ tier, count, pct, cls }) => (
                    <div key={tier}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-stone-400 font-medium">{tier}</span>
                        <span className="text-stone-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
                        <div className={`h-full ${cls} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Export */}
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Export All Users as CSV
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

/* ── Small helpers ── */
const INPUT_CLS = "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-haldi-600 placeholder-stone-600";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ActionBtn({
  title, onClick, danger = false, active = false, children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${
        danger  ? "text-stone-500 hover:text-red-400 hover:bg-red-900/20" :
        active  ? "text-emerald-400 hover:bg-emerald-900/20" :
                  "text-stone-500 hover:text-stone-200 hover:bg-stone-800"
      }`}
    >
      {children}
    </button>
  );
}

function TierSelect({ current, onChange }: { current: string | null; onChange: (t: string) => void }) {
  return (
    <select
      value={current || "Basic"}
      onChange={e => onChange(e.target.value)}
      className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-300 focus:outline-none focus:border-haldi-600"
    >
      <option value="Basic">Basic</option>
      <option value="Gold">Gold</option>
      <option value="Concierge">Concierge</option>
    </select>
  );
}
