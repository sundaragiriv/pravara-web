"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Share2, Copy, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ShieldProps {
  profileId: string;
  isOwnProfile: boolean;
}

export default function VaraahiShield({ profileId, isOwnProfile }: ShieldProps) {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEndorsements = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('endorsements')
        .select('*')
        .eq('profile_id', profileId);
      if (data) setEndorsements(data);
    };
    fetchEndorsements();
  }, [profileId]);

  const copyLink = () => {
    // Generates a link like: http://localhost:3000/vouch/USER_ID
    const link = `${window.location.origin}/vouch/${profileId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-green-900/20 to-stone-900 border border-green-500/30 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="text-green-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4" /> Varaahi Verified
           </div>
           <h3 className="text-lg font-serif text-stone-100">Trust Circle</h3>
        </div>
        <div className="text-right">
           <div className="text-2xl font-bold text-stone-200">{endorsements.length}</div>
           <div className="text-[10px] text-stone-500 uppercase">Vouches</div>
        </div>
      </div>

      {/* List of Vouches */}
      <div className="space-y-3 mb-4">
        {endorsements.length === 0 ? (
            <p className="text-sm text-stone-500 italic">No endorsements yet.</p>
        ) : (
            endorsements.slice(0, 3).map((e, i) => (
                <div key={i} className="text-sm border-l-2 border-green-500/20 pl-3">
                    <p className="text-stone-300 italic">"{e.comment}"</p>
                    <p className="text-green-600 text-xs font-bold mt-1">— {e.endorser_name} ({e.relation})</p>
                </div>
            ))
        )}
      </div>

      {/* Copy Link Button (Only for Owner) */}
      {isOwnProfile && (
        <button 
          onClick={copyLink}
          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <ShieldCheck className="w-3 h-3 text-green-500" /> : <Share2 className="w-3 h-3" />}
          {copied ? "Link Copied!" : "Invite Friends to Vouch"}
        </button>
      )}
    </div>
  );
}
