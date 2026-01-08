"use client";

import { ShieldCheck, Upload, CheckCircle2, Users } from "lucide-react";

interface TrustHubProps {
  profile: any;
  onUploadId: () => void;
}

export default function TrustHub({ profile, onUploadId }: TrustHubProps) {
  return (
    <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 relative overflow-hidden mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <ShieldCheck className="w-32 h-32" />
      </div>

      {/* --- RESTORED BRANDING HEADER --- */}
      <div className="mb-6 border-b border-stone-800 pb-4">
        <h3 className="text-lg font-bold text-stone-200 flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
           <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
             Varaahi Shield
           </span>
        </h3>
        <p className="text-stone-500 text-xs mt-1">
          Pravara's Multi-Layer Trust & Safety Protocol
        </p>
      </div>

      {/* --- TWO-COLUMN LAYOUT (ID + TRUST CIRCLE) --- */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        
        {/* SECTION 1: HARD VERIFICATION (ID) */}
        <div className="flex-1 w-full border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" /> Identity Verification
          </div>
          <h3 className="text-xl font-serif text-stone-200 mb-1">Government ID</h3>
          <p className="text-stone-400 text-sm mb-4">
            {profile.verified_id 
              ? "Your identity has been verified securely." 
              : "Upload Aadhar or Passport to earn the Blue Check."}
          </p>

          {profile.verified_id ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/20 text-emerald-400 rounded-xl font-bold text-sm border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> ID Verified
            </div>
          ) : (
            <button
              onClick={onUploadId}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" /> Upload Aadhar
            </button>
          )}
        </div>

        {/* SECTION 2: SOFT VERIFICATION (VOUCHES) */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-haldi-500 text-xs font-bold uppercase tracking-widest">
              <Users className="w-4 h-4" /> Trust Circle
            </div>
            <div className="text-2xl font-bold text-stone-600">
              0 <span className="text-[10px] uppercase align-middle text-stone-500">Vouches</span>
            </div>
          </div>
          <h3 className="text-xl font-serif text-stone-200 mb-1">Social Endorsements</h3>
          <p className="text-stone-400 text-sm mb-4">
            Valid profiles need at least 2 vouches from friends.
          </p>

          <button className="w-full py-2.5 bg-stone-100 hover:bg-white text-stone-950 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            Invite Friends to Vouch
          </button>
        </div>
      </div>
    </div>
  );
}
