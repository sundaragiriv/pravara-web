"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users, Tag, BarChart2, ShieldCheck, Search, LogOut,
  Plus, Trash2, Lock, Unlock, RefreshCw, Download,
  CheckCircle, XCircle, Crown, ChevronDown, Settings,
  Calendar, UserCheck, Loader2, Eye, EyeOff, Save,
  Mail, Edit2, X, ToggleLeft, ToggleRight, Zap, Image as ImageIcon,
  AlertTriangle, Bell, Globe,
} from "lucide-react";

/* ═══════════════════════════════════════════════════ Types */
type Tab = "users" | "memberships" | "coupons" | "analytics" | "config";

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
  image_url: string | null;
  location: string | null;
  bio: string | null;
}

interface MembershipPlan {
  id: string;
  tier: string;
  price_monthly: number;
  price_annual: number;
  max_daily_invitations: number;
  bhrugu_engine: boolean;
  photo_limit: number;
  contact_reveal: boolean;
  priority_matching: boolean;
  shortlist_limit: number;
  features: string[];
  is_active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount_pct: number;
  max_uses: number;
  used_count: number;
  valid_until: string | null;
  tier_target: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

interface SiteConfig { key: string; value: string; description: string | null; }

/* ═══════════════════════════════════════════════════ Helpers */
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TIER_STYLE: Record<string, string> = {
  Concierge: "bg-purple-900/40 text-purple-300 border-purple-700",
  Gold:       "bg-amber-900/40 text-amber-300 border-amber-700",
  Basic:      "bg-stone-800 text-stone-400 border-stone-700",
};

function TierBadge({ tier }: { tier: string | null }) {
  const t = tier || "Basic";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${TIER_STYLE[t] ?? TIER_STYLE.Basic}`}>
      {(t === "Concierge" || t === "Gold") && <Crown className="w-3 h-3" />}
      {t}
    </span>
  );
}

/* ═══════════════════════════════════════════════════ Edit Drawer */
function UserEditDrawer({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (u: AdminUser) => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name:        form.full_name,
      phone:            form.phone,
      membership_tier:  form.membership_tier,
      is_verified:      form.is_verified,
      is_active:        form.is_active,
      bio:              form.bio,
      location:         form.location,
    }).eq("id", form.id);
    if (error) { toast.error(error.message); }
    else { toast.success("Profile updated."); onSave(form); }
    setSaving(false);
  };

  const sendPasswordReset = async () => {
    if (!form.email) return;
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(`Password reset email sent to ${form.email}`);
    setResetting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-lg bg-stone-950 border-l border-stone-800 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 sticky top-0 bg-stone-950 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-haldi-800 flex items-center justify-center overflow-hidden">
              {form.image_url
                ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-stone-950 font-bold">{form.full_name?.[0] ?? "?"}</span>}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-100">{form.full_name || "Unnamed user"}</p>
              <p className="text-xs text-stone-500">{form.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-stone-500 hover:text-stone-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 py-6 space-y-5">
          <DrawerField label="Full Name">
            <input value={form.full_name ?? ""} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={DI} placeholder="Full name" />
          </DrawerField>
          <DrawerField label="Phone">
            <input value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className={DI} placeholder="+91 98765 43210" />
          </DrawerField>
          <DrawerField label="Location">
            <input value={form.location ?? ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className={DI} placeholder="City, State" />
          </DrawerField>
          <DrawerField label="Bio">
            <textarea value={form.bio ?? ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className={`${DI} resize-none`} rows={3} placeholder="Short bio…" />
          </DrawerField>
          <DrawerField label="Membership Tier">
            <select value={form.membership_tier ?? "Basic"} onChange={e => setForm(f => ({ ...f, membership_tier: e.target.value }))}
              className={DI}>
              <option value="Basic">Basic</option>
              <option value="Gold">Gold</option>
              <option value="Concierge">Concierge</option>
            </select>
          </DrawerField>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="Account Active" value={form.is_active !== false}
              onChange={v => setForm(f => ({ ...f, is_active: v }))} />
            <Toggle label="Varahi Verified" value={!!form.is_verified}
              onChange={v => setForm(f => ({ ...f, is_verified: v }))} />
            <Toggle label="Admin Access" value={!!form.is_admin}
              onChange={v => setForm(f => ({ ...f, is_admin: v }))} />
          </div>

          {/* Info row */}
          <div className="bg-stone-900 rounded-xl p-4 text-xs text-stone-500 space-y-1 border border-stone-800">
            <div className="flex justify-between"><span>User ID</span><span className="font-mono text-stone-400">{form.id.slice(0,16)}…</span></div>
            <div className="flex justify-between"><span>Joined</span><span>{fmt(form.created_at)}</span></div>
            <div className="flex justify-between"><span>Email</span><span className="text-stone-400">{form.email}</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-stone-950 border-t border-stone-800 px-6 py-4 flex flex-col gap-2">
          <button type="button" onClick={save} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          <button type="button" onClick={sendPasswordReset} disabled={resetting || !form.email}
            className="w-full flex items-center justify-center gap-2 py-2 border border-stone-700 hover:border-stone-600 text-stone-400 hover:text-stone-200 rounded-xl text-sm transition-colors disabled:opacity-40">
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send Password Reset Email
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ Main Page */
export default function AdminPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [tab,        setTab]        = useState<Tab>("users");
  const [loading,    setLoading]    = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminName,  setAdminName]  = useState("");

  /* Users */
  const [users,       setUsers]       = useState<AdminUser[]>([]);
  const [userSearch,  setUserSearch]  = useState("");
  const [tierFilter,  setTierFilter]  = useState("all");
  const [editUser,    setEditUser]    = useState<AdminUser | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  /* Memberships */
  const [plans,       setPlans]       = useState<MembershipPlan[]>([]);
  const [savingPlan,  setSavingPlan]  = useState<string | null>(null);

  /* Coupons */
  const [coupons,      setCoupons]      = useState<Coupon[]>([]);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [newCoupon,    setNewCoupon]    = useState({ code:"", discount_pct:10, max_uses:50, valid_until:"", tier_target:"", notes:"" });

  /* Analytics */
  const [stats, setStats] = useState({ total:0, basic:0, gold:0, concierge:0, thisMonth:0, verified:0, locked:0 });

  /* Config */
  const [config,      setConfig]      = useState<SiteConfig[]>([]);
  const [savingKey,   setSavingKey]   = useState<string | null>(null);

  /* ── Auth guard ─────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const { data } = await supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).single();
      if (!data?.is_admin) { toast.error("Admins only."); router.push("/dashboard"); return; }
      setAdminName((data.full_name || "Admin").split(" ")[0]);
      setAuthorized(true);
      setLoading(false);
    })();
  }, []);

  /* ── Load data on tab change ────────────────────────────── */
  useEffect(() => {
    if (!authorized) return;
    if (tab === "users")       loadUsers();
    if (tab === "memberships") loadPlans();
    if (tab === "coupons")     loadCoupons();
    if (tab === "analytics")   loadStats();
    if (tab === "config")      loadConfig();
  }, [authorized, tab]);

  /* ── Loaders ────────────────────────────────────────────── */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles")
      .select("id, full_name, email, phone, membership_tier, is_admin, is_verified, is_active, created_at, image_url, location, bio")
      .order("created_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    else setUsers(data as AdminUser[]);
    setLoading(false);
  }, []);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("membership_plans").select("*").order("price_monthly");
    if (error) toast.error(error.message);
    else setPlans(data as MembershipPlan[]);
    setLoading(false);
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCoupons(data as Coupon[]);
    setLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("membership_tier, is_verified, is_active, created_at");
    if (data) {
      const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStats({
        total:     data.length,
        basic:     data.filter(r => !r.membership_tier || r.membership_tier === "Basic").length,
        gold:      data.filter(r => r.membership_tier === "Gold").length,
        concierge: data.filter(r => r.membership_tier === "Concierge").length,
        thisMonth: data.filter(r => new Date(r.created_at) >= start).length,
        verified:  data.filter(r => r.is_verified).length,
        locked:    data.filter(r => r.is_active === false).length,
      });
    }
    setLoading(false);
  }, []);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_config").select("*").order("key");
    if (error) toast.error(error.message);
    else setConfig(data as SiteConfig[]);
    setLoading(false);
  }, []);

  /* ── User actions ───────────────────────────────────────── */
  const toggleLock = async (u: AdminUser) => {
    setActioningId(u.id);
    const next = !( u.is_active !== false );
    const { error } = await supabase.from("profiles").update({ is_active: next }).eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success(next ? `${u.full_name || "User"} unlocked — visible in matches.` : `${u.full_name || "User"} locked — hidden from matches.`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: next } : x));
    }
    setActioningId(null);
  };

  /* ── Plan save ──────────────────────────────────────────── */
  const savePlan = async (plan: MembershipPlan) => {
    setSavingPlan(plan.tier);
    const { error } = await supabase.from("membership_plans").update({
      price_monthly: plan.price_monthly,
      price_annual:  plan.price_annual,
      max_daily_invitations: plan.max_daily_invitations,
      bhrugu_engine: plan.bhrugu_engine,
      photo_limit:   plan.photo_limit,
      contact_reveal: plan.contact_reveal,
      priority_matching: plan.priority_matching,
      shortlist_limit: plan.shortlist_limit,
      features:      plan.features,
      updated_at:    new Date().toISOString(),
    }).eq("tier", plan.tier);
    if (error) toast.error(error.message);
    else toast.success(`${plan.tier} plan saved.`);
    setSavingPlan(null);
  };

  /* ── Coupon create ──────────────────────────────────────── */
  const createCoupon = async () => {
    if (!newCoupon.code.trim()) { toast.error("Code required"); return; }
    setSavingCoupon(true);
    const { error } = await supabase.from("coupons").insert({
      code:         newCoupon.code.trim().toUpperCase(),
      discount_pct: newCoupon.discount_pct,
      max_uses:     newCoupon.max_uses,
      tier_target:  newCoupon.tier_target || null,
      notes:        newCoupon.notes || null,
      valid_until:  newCoupon.valid_until ? new Date(newCoupon.valid_until).toISOString() : null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Coupon created."); setNewCoupon({ code:"", discount_pct:10, max_uses:50, valid_until:"", tier_target:"", notes:"" }); loadCoupons(); }
    setSavingCoupon(false);
  };

  /* ── Config save ────────────────────────────────────────── */
  const saveConfig = async (key: string, value: string) => {
    setSavingKey(key);
    const { error } = await supabase.from("site_config").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    if (error) toast.error(error.message);
    else { toast.success("Saved."); setConfig(prev => prev.map(c => c.key === key ? { ...c, value } : c)); }
    setSavingKey(null);
  };

  /* ── CSV export ─────────────────────────────────────────── */
  const exportCSV = () => {
    const header = ["Name","Email","Phone","Tier","Verified","Status","Joined"];
    const rows = filteredUsers.map(u => [
      u.full_name ?? "", u.email ?? "", u.phone ?? "",
      u.membership_tier ?? "Basic", u.is_verified ? "Yes":"No",
      u.is_active === false ? "Locked":"Active", fmt(u.created_at),
    ]);
    const csv = [header,...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type:"text/csv" })), download:"pravara_users.csv" });
    a.click();
  };

  /* ── Filtered users ─────────────────────────────────────── */
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      (!q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q)) &&
      (tierFilter === "all" || (u.membership_tier || "Basic") === tierFilter)
    );
  });

  /* ── Loading / auth guard ───────────────────────────────── */
  if (!authorized) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
    </div>
  );

  /* ══════════════════════════════════════════════════ RENDER */
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-stone-950/95 border-b border-stone-900 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <Image src="/logo3.png" alt="Pravara" width={100} height={34}
              className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all" priority />
          </Link>
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <ShieldCheck className="w-4 h-4 text-haldi-500" />
            <span className="hidden sm:inline font-medium text-stone-300">Admin</span>
            <span className="text-stone-700 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{adminName}</span>
          </div>
          <button type="button" onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
            className="flex items-center gap-2 text-stone-500 hover:text-red-400 text-sm transition-colors">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="border-b border-stone-900 bg-stone-950">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex gap-0 overflow-x-auto">
          {([
            { key:"users",       label:"Users",       icon: Users      },
            { key:"memberships", label:"Memberships", icon: Crown      },
            { key:"coupons",     label:"Coupons",     icon: Tag        },
            { key:"analytics",   label:"Analytics",   icon: BarChart2  },
            { key:"config",      label:"Site Config", icon: Settings   },
          ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === key ? "border-haldi-500 text-haldi-400" : "border-transparent text-stone-500 hover:text-stone-300"
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-haldi-500 animate-spin" /></div>}

        {/* ═══════ USERS TAB ═══════════════════════════════════════ */}
        {!loading && tab === "users" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search name, email, phone…"
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-haldi-600" />
              </div>
              <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-300 focus:outline-none">
                <option value="all">All Tiers</option>
                <option value="Basic">Basic</option>
                <option value="Gold">Gold</option>
                <option value="Concierge">Concierge</option>
              </select>
              <button type="button" onClick={loadUsers} className={BTN_GHOST}><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
              <button type="button" onClick={exportCSV}  className={BTN_GHOST}><Download className="w-3.5 h-3.5" /> CSV</button>
              <span className="text-stone-600 text-sm">{filteredUsers.length} users</span>
            </div>

            {/* Table */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-900/60 text-left text-stone-400 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3 hidden md:table-cell">Contact</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-stone-800/50 hover:bg-stone-900/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-haldi-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {u.image_url ? <img src={u.image_url} alt="" className="w-full h-full object-cover" />
                                : <span className="text-xs text-stone-950 font-bold">{u.full_name?.[0] ?? "?"}</span>}
                            </div>
                            <div>
                              <div className="font-medium text-stone-200 flex items-center gap-1.5">
                                {u.full_name || <span className="text-stone-600 italic">No name</span>}
                                {u.is_admin && <span className="text-[9px] bg-haldi-900 text-haldi-400 px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>}
                                {u.is_verified && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                              </div>
                              <div className="text-xs text-stone-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-stone-400">{u.phone || "—"}</td>
                        <td className="px-4 py-3"><TierBadge tier={u.membership_tier} /></td>
                        <td className="px-4 py-3 text-xs text-stone-500 hidden lg:table-cell">{fmt(u.created_at)}</td>
                        <td className="px-4 py-3">
                          {u.is_active === false
                            ? <span className="flex items-center gap-1 text-red-400 text-xs"><Lock className="w-3 h-3" /> Locked</span>
                            : <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" /> Active</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {actioningId === u.id
                              ? <Loader2 className="w-4 h-4 animate-spin text-haldi-500" />
                              : <>
                                  <ActionBtn title="Edit profile" onClick={() => setEditUser(u)}><Edit2 className="w-3.5 h-3.5" /></ActionBtn>
                                  <ActionBtn title={u.is_active === false ? "Unlock (show in matches)" : "Lock (hide from matches)"} onClick={() => toggleLock(u)} danger={u.is_active !== false}>
                                    {u.is_active === false ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </ActionBtn>
                                </>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-600">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ MEMBERSHIPS TAB ═════════════════════════════════ */}
        {!loading && tab === "memberships" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-stone-100">Membership Plans</h2>
              <p className="text-sm text-stone-500 mt-1">Edit prices, feature flags, and limits for each tier. Changes take effect immediately.</p>
            </div>

            {plans.length === 0 && (
              <div className="text-center py-16 text-stone-600">
                <p>No plans found. Make sure you ran <code className="text-stone-400">add_admin_cms_tables.sql</code> in Supabase.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map(plan => (
                <PlanCard key={plan.tier} plan={plan} saving={savingPlan === plan.tier}
                  onChange={updated => setPlans(prev => prev.map(p => p.tier === plan.tier ? updated : p))}
                  onSave={() => savePlan(plan)} />
              ))}
            </div>
          </div>
        )}

        {/* ═══════ COUPONS TAB ═════════════════════════════════════ */}
        {!loading && tab === "coupons" && (
          <div className="space-y-8">
            {/* Create */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-stone-200 mb-5 flex items-center gap-2"><Plus className="w-4 h-4 text-haldi-500" /> Create Coupon</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CFld label="Code"><input value={newCoupon.code} onChange={e => setNewCoupon(n=>({...n,code:e.target.value}))} placeholder="VEDIC20" className={CI} /></CFld>
                <CFld label="Discount %"><input type="number" min={1} max={100} value={newCoupon.discount_pct} onChange={e=>setNewCoupon(n=>({...n,discount_pct:+e.target.value}))} className={CI} /></CFld>
                <CFld label="Max Uses"><input type="number" min={1} value={newCoupon.max_uses} onChange={e=>setNewCoupon(n=>({...n,max_uses:+e.target.value}))} className={CI} /></CFld>
                <CFld label="Expires (leave blank = never)"><input type="date" value={newCoupon.valid_until} onChange={e=>setNewCoupon(n=>({...n,valid_until:e.target.value}))} className={CI} /></CFld>
                <CFld label="For Tier (optional)">
                  <select value={newCoupon.tier_target} onChange={e=>setNewCoupon(n=>({...n,tier_target:e.target.value}))} className={CI}>
                    <option value="">Any tier</option><option value="Gold">Gold</option><option value="Concierge">Concierge</option>
                  </select>
                </CFld>
                <CFld label="Notes"><input value={newCoupon.notes} onChange={e=>setNewCoupon(n=>({...n,notes:e.target.value}))} placeholder="Internal note…" className={CI} /></CFld>
              </div>
              <button type="button" onClick={createCoupon} disabled={savingCoupon}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-colors disabled:opacity-50">
                {savingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </button>
            </div>

            {/* List */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-200">All Coupons</h2>
                <span className="text-stone-500 text-sm">{coupons.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 bg-stone-900/60 text-xs text-stone-400 uppercase tracking-wider text-left">
                      {["Code","Discount","Uses","Target","Expires","Status",""].map(h=>(
                        <th key={h} className="px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} className="border-b border-stone-800/50 hover:bg-stone-900/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-haldi-300">{c.code}</td>
                        <td className="px-4 py-3">{c.discount_pct}%</td>
                        <td className="px-4 py-3 text-stone-400">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                              <div className="h-full bg-haldi-600 rounded-full" style={{ width: `${Math.min(100,(c.used_count/c.max_uses)*100)}%` }} />
                            </div>
                            <span className="text-xs">{c.used_count}/{c.max_uses}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{c.tier_target ? <TierBadge tier={c.tier_target} /> : <span className="text-stone-600">Any</span>}</td>
                        <td className="px-4 py-3 text-xs text-stone-500">{c.valid_until ? fmt(c.valid_until) : "Never"}</td>
                        <td className="px-4 py-3">
                          {c.is_active
                            ? <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                            : <span className="text-stone-600 text-xs flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Expired</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.is_active && (
                            <button type="button" onClick={async () => {
                              await supabase.from("coupons").update({ is_active: false }).eq("id", c.id);
                              toast.success("Coupon expired."); loadCoupons();
                            }} className="text-xs text-stone-500 hover:text-red-400 flex items-center gap-1 ml-auto transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Expire
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-600">No coupons yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ ANALYTICS TAB ═══════════════════════════════════ */}
        {!loading && tab === "analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {[
                { label:"Total",    value: stats.total,     color:"text-stone-200",  icon: Users       },
                { label:"Basic",    value: stats.basic,     color:"text-stone-400",  icon: Users       },
                { label:"Gold",     value: stats.gold,      color:"text-amber-400",  icon: Crown       },
                { label:"Concierge",value: stats.concierge, color:"text-purple-400", icon: Crown       },
                { label:"This Month",value:stats.thisMonth, color:"text-emerald-400",icon: Calendar    },
                { label:"Verified", value: stats.verified,  color:"text-blue-400",   icon: ShieldCheck },
                { label:"Locked",   value: stats.locked,    color:"text-red-400",    icon: Lock        },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-stone-900/40 border border-stone-800 rounded-2xl p-4">
                  <div className={`flex items-center gap-1.5 mb-2 ${color}`}><Icon className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Tier bar */}
            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-5">Tier Distribution</h3>
              {[
                { tier:"Basic",     count:stats.basic,     pct: stats.total ? Math.round(stats.basic/stats.total*100) : 0,     cls:"bg-stone-600" },
                { tier:"Gold",      count:stats.gold,      pct: stats.total ? Math.round(stats.gold/stats.total*100) : 0,      cls:"bg-amber-600" },
                { tier:"Concierge", count:stats.concierge, pct: stats.total ? Math.round(stats.concierge/stats.total*100) : 0, cls:"bg-purple-600" },
              ].map(({ tier, count, pct, cls }) => (
                <div key={tier} className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-stone-400 font-medium">{tier}</span>
                    <span className="text-stone-500">{count} users ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cls} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export Users as CSV
            </button>
          </div>
        )}

        {/* ═══════ SITE CONFIG TAB ═════════════════════════════════ */}
        {!loading && tab === "config" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-stone-100">Site Configuration</h2>
              <p className="text-sm text-stone-500 mt-1">Feature flags and global settings. Changes are live immediately.</p>
            </div>

            {config.length === 0 && (
              <div className="text-center py-16 text-stone-600">
                Run <code className="text-stone-400">add_admin_cms_tables.sql</code> in Supabase to create the config table.
              </div>
            )}

            <div className="bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
              {config.map((c, i) => (
                <ConfigRow key={c.key} cfg={c} saving={savingKey === c.key}
                  isLast={i === config.length - 1}
                  onSave={value => saveConfig(c.key, value)} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit user drawer */}
      {editUser && (
        <UserEditDrawer
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={updated => {
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════ Sub-components */

function PlanCard({ plan, saving, onChange, onSave }: {
  plan: MembershipPlan;
  saving: boolean;
  onChange: (p: MembershipPlan) => void;
  onSave: () => void;
}) {
  const tierColor = plan.tier === "Concierge" ? "border-purple-700 bg-purple-900/10"
                  : plan.tier === "Gold"       ? "border-amber-700 bg-amber-900/10"
                  : "border-stone-800 bg-stone-900/20";
  const labelColor = plan.tier === "Concierge" ? "text-purple-400"
                   : plan.tier === "Gold"       ? "text-amber-400"
                   : "text-stone-400";

  return (
    <div className={`border ${tierColor} rounded-2xl p-6 flex flex-col gap-5`}>
      <div className="flex items-center justify-between">
        <div className={`text-base font-bold uppercase tracking-wider flex items-center gap-2 ${labelColor}`}>
          {(plan.tier === "Gold" || plan.tier === "Concierge") && <Crown className="w-4 h-4" />}
          {plan.tier}
        </div>
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <PlanField label="Monthly (₹ or $)">
          <input type="number" min={0} value={plan.price_monthly}
            onChange={e => onChange({ ...plan, price_monthly: +e.target.value })} className={PI} />
        </PlanField>
        <PlanField label="Annual (₹ or $)">
          <input type="number" min={0} value={plan.price_annual}
            onChange={e => onChange({ ...plan, price_annual: +e.target.value })} className={PI} />
        </PlanField>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-3">
        <PlanField label="Invitations/day">
          <input type="number" min={0} value={plan.max_daily_invitations}
            onChange={e => onChange({ ...plan, max_daily_invitations: +e.target.value })} className={PI} />
        </PlanField>
        <PlanField label="Photo limit">
          <input type="number" min={1} value={plan.photo_limit}
            onChange={e => onChange({ ...plan, photo_limit: +e.target.value })} className={PI} />
        </PlanField>
        <PlanField label="Shortlist limit">
          <input type="number" min={1} value={plan.shortlist_limit}
            onChange={e => onChange({ ...plan, shortlist_limit: +e.target.value })} className={PI} />
        </PlanField>
      </div>

      {/* Feature toggles */}
      <div className="space-y-2">
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Feature Flags</p>
        <Toggle label="Bhrugu Engine"     value={plan.bhrugu_engine}     onChange={v => onChange({ ...plan, bhrugu_engine: v })} />
        <Toggle label="Contact Reveal"    value={plan.contact_reveal}    onChange={v => onChange({ ...plan, contact_reveal: v })} />
        <Toggle label="Priority Matching" value={plan.priority_matching} onChange={v => onChange({ ...plan, priority_matching: v })} />
      </div>

      {/* Features text list */}
      <div>
        <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">Feature List (one per line)</p>
        <textarea
          value={(plan.features as string[]).join("\n")}
          onChange={e => onChange({ ...plan, features: e.target.value.split("\n").filter(Boolean) })}
          className={`${PI} resize-none text-xs`} rows={5}
        />
      </div>
    </div>
  );
}

function ConfigRow({ cfg, saving, isLast, onSave }: {
  cfg: SiteConfig; saving: boolean; isLast: boolean;
  onSave: (v: string) => void;
}) {
  const [val, setVal] = useState(cfg.value);
  const isBool = cfg.value === "true" || cfg.value === "false";

  return (
    <div className={`flex items-start gap-4 px-6 py-4 ${!isLast ? "border-b border-stone-800/70" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-semibold text-haldi-300">{cfg.key}</p>
        {cfg.description && <p className="text-xs text-stone-500 mt-0.5">{cfg.description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isBool ? (
          <button type="button" onClick={() => { const next = val === "true" ? "false" : "true"; setVal(next); onSave(next); }}
            className="flex items-center gap-2 text-sm transition-colors">
            {val === "true"
              ? <ToggleRight className="w-8 h-8 text-emerald-400" />
              : <ToggleLeft  className="w-8 h-8 text-stone-600" />}
            <span className={val === "true" ? "text-emerald-400 text-xs font-bold" : "text-stone-600 text-xs"}>
              {val === "true" ? "ON" : "OFF"}
            </span>
          </button>
        ) : (
          <>
            <input value={val} onChange={e => setVal(e.target.value)}
              className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-haldi-600 w-56" />
            <button type="button" onClick={() => onSave(val)} disabled={saving || val === cfg.value}
              className="flex items-center gap-1 px-3 py-1.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ Tiny helpers */
const DI = "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-haldi-600 placeholder-stone-600";
const PI = "w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-haldi-500";
const CI = "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-haldi-600 placeholder-stone-600";
const BTN_GHOST = "flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 text-sm transition-colors";

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs text-stone-500 font-medium mb-1.5">{label}</label>{children}</div>;
}
function PlanField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">{label}</label>{children}</div>;
}
function CFld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs text-stone-500 font-medium mb-1.5">{label}</label>{children}</div>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-1.5 px-2 rounded-lg hover:bg-stone-800/60 transition-colors group">
      <span className="text-sm text-stone-400 group-hover:text-stone-300">{label}</span>
      {value
        ? <ToggleRight className="w-6 h-6 text-emerald-400 flex-shrink-0" />
        : <ToggleLeft  className="w-6 h-6 text-stone-600 flex-shrink-0" />}
    </button>
  );
}

function ActionBtn({ title, onClick, danger, children }: {
  title: string; onClick: () => void; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${danger ? "text-stone-500 hover:text-red-400 hover:bg-red-900/20" : "text-stone-500 hover:text-stone-200 hover:bg-stone-800"}`}>
      {children}
    </button>
  );
}
