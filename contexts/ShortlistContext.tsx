"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";

/**
 * The Supabase browser client is imported on demand rather than at module
 * scope.
 *
 * This provider sits in the ROOT layout, so a static `import` put the whole
 * ~198KB SDK into the first-paint bundle of every page — including the
 * pre-launch landing page, where nobody is signed in and there is no shortlist
 * to load. It was the largest thing on that page's critical path that the page
 * had no use for.
 *
 * Loaded once, on first actual use, and cached.
 */
let clientPromise: Promise<ReturnType<typeof import("@/utils/supabase/client").createClient>> | null = null;

function getSupabase() {
  if (!clientPromise) {
    clientPromise = import("@/utils/supabase/client").then((m) => m.createClient());
  }
  return clientPromise;
}

interface ShortlistContextValue {
  /** Set of shortlisted profile IDs — the single source of truth */
  ids: Set<string>;
  isShortlisted: (profileId: string) => boolean;
  /** Toggle add/remove — for star buttons on cards and panels */
  toggle: (profileId: string) => Promise<void>;
  /** Explicit remove — for the Shortlist page's Trash button */
  remove: (profileId: string) => Promise<void>;
  count: number;
  /** Force a full re-sync from DB (call after external mutations) */
  refresh: () => Promise<void>;
}

const ShortlistContext = createContext<ShortlistContextValue>({
  ids: new Set(),
  isShortlisted: () => false,
  toggle: async () => {},
  remove: async () => {},
  count: 0,
  refresh: async () => {},
});

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const supabase = await getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("shortlists")
      .select("profile_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("[ShortlistContext] refresh failed:", error.code, error.message);
      return;
    }
    if (data) {
      setIds(new Set(data.map((r: { profile_id: string }) => r.profile_id)));
    }
  }, []);

  // Fetch on mount + whenever the browser tab regains focus
  useEffect(() => {
    refresh();
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  const toggle = useCallback(
    async (profileId: string) => {
      const supabase = await getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to shortlist profiles");
        return;
      }

      const wasShortlisted = ids.has(profileId);

      // Optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (wasShortlisted) next.delete(profileId);
        else next.add(profileId);
        return next;
      });

      try {
        if (wasShortlisted) {
          const { error } = await supabase
            .from("shortlists")
            .delete()
            .eq("user_id", user.id)
            .eq("profile_id", profileId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("shortlists")
            .insert({ user_id: user.id, profile_id: profileId, added_by_email: user.email });
          if (error) throw error;
          toast.success("Added to your shortlist");
        }
      } catch (err: unknown) {
        // Rollback on failure
        setIds((prev) => {
          const next = new Set(prev);
          if (wasShortlisted) next.add(profileId);
          else next.delete(profileId);
          return next;
        });
        const pg = err as { code?: string; message?: string };
        console.error("[ShortlistContext] toggle failed:", pg?.code, pg?.message);
        // 23505 = unique_violation (row already exists — the SELECT was blocked so ids was empty)
        toast.error("Could not update shortlist — please try again");
      }
    },
    [ids]
  );

  const remove = useCallback(
    async (profileId: string) => {
      const supabase = await getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(profileId);
        return next;
      });

      const { error } = await supabase
        .from("shortlists")
        .delete()
        .eq("user_id", user.id)
        .eq("profile_id", profileId);

      if (error) {
        // Restore on failure
        setIds((prev) => new Set([...prev, profileId]));
        toast.error("Could not remove from shortlist");
      }
    },
    []
  );

  return (
    <ShortlistContext.Provider
      value={{
        ids,
        isShortlisted: (id) => ids.has(id),
        toggle,
        remove,
        count: ids.size,
        refresh,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
}

export const useShortlist = () => useContext(ShortlistContext);
