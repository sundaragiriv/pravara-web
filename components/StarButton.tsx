"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface StarButtonProps {
  profileId: string;
  currentUserId?: string; 
  onToggle?: () => void;
}

export default function StarButton({ profileId, currentUserId: initialUserId, onToggle }: StarButtonProps) {
  const supabase = createClient();
  // We keep state only for UI (is it yellow?), not for data identity
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 1. Initial Load: Check if star should be yellow
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
           setLoading(false);
           return;
        }

        // Check DB to see if this profile is already in my list
        const { data } = await supabase
          .from('shortlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .maybeSingle();
        
        if (data) setIsShortlisted(true);
      } catch (err) {
        console.error("Status Check Error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [profileId]);

  // 2. The Fix: Fetch User ON CLICK to prevent "Null" errors
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (processing) return;

    setProcessing(true);

    try {
        // CRITICAL FIX: Fetch user RIGHT NOW. Do not rely on stale state.
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            alert("Please log in to shortlist profiles.");
            setProcessing(false);
            return;
        }

        const userId = user.id;
        const userEmail = user.email;

        // Optimistic UI Update (Turn yellow instantly)
        const previousState = isShortlisted;
        setIsShortlisted(!previousState);

        if (previousState) {
            // Remove
            const { error } = await supabase
                .from('shortlists')
                .delete()
                .eq('user_id', userId)
                .eq('profile_id', profileId);
            if (error) throw error;
        } else {
            // Add
            const { error } = await supabase
                .from('shortlists')
                .insert({ 
                    user_id: userId, 
                    profile_id: profileId,
                    added_by_email: userEmail 
                });
            
            // Ignore "Already Exists" duplicates
            if (error && error.code !== '23505') throw error;
        }

        if (onToggle) onToggle();

    } catch (err: any) {
        console.error("Toggle Error:", err.message);
        // Revert UI on failure
        setIsShortlisted(prev => !prev);
        alert(`Action failed: ${err.message}`);
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="p-2"><Loader2 className="w-5 h-5 animate-spin text-stone-600" /></div>;

  return (
    <button 
      onClick={handleToggle}
      disabled={processing}
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all z-50 relative ${
        isShortlisted 
          ? "bg-haldi-500 border-haldi-600 text-stone-950 shadow-[0_0_15px_rgba(255,193,7,0.3)]" 
          : "bg-stone-800 border-stone-700 text-stone-400 hover:text-haldi-500 hover:border-haldi-500/50"
      }`}
    >
      <Star className={`w-5 h-5 ${isShortlisted ? "fill-stone-950" : ""}`} />
    </button>
  );
}
