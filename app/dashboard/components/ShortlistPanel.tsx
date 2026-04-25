"use client";

import Image from "next/image";
import { Star, User, Users, X } from "lucide-react";
import type { MatchProfile, ShortlistItem } from "@/types";

interface ShortlistPanelProps {
  shortlist: ShortlistItem[];
  currentUserEmail?: string;
  onRemoveShortlist: (itemId: string) => void;
  onProfileSelect: (profile: MatchProfile) => void;
}

export default function ShortlistPanel({
  shortlist,
  currentUserEmail,
  onRemoveShortlist,
  onProfileSelect,
}: ShortlistPanelProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {shortlist.length === 0 && (
        <div className="col-span-3 rounded-2xl border border-dashed border-stone-800 bg-stone-900/20 py-12 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-stone-600" />
          <h3 className="font-medium text-stone-300">Your Treasury is Empty</h3>
          <p className="mt-1 text-sm text-stone-500">Star profiles to save them here.</p>
        </div>
      )}

      {shortlist.map((item) => {
        const match = item.profile;
        const isFamilyRecommendation = item.added_by_email !== currentUserEmail;

        if (!match) return null;

        return (
          <div
            key={item.id}
            className={`relative overflow-hidden rounded-2xl border bg-stone-900 shadow-xl ${
              isFamilyRecommendation
                ? "border-haldi-500/50 shadow-haldi-900/10"
                : "border-stone-800"
            }`}
          >
            {isFamilyRecommendation && (
              <div className="flex items-center gap-3 border-b border-haldi-500/20 bg-haldi-900/20 p-3">
                <Users className="h-3 w-3 text-haldi-500" />
                <span className="text-xs font-bold uppercase text-haldi-500">Family Rec</span>
              </div>
            )}

            <div className="relative h-64 bg-stone-800">
              {match.image_url ? (
                <Image
                  src={match.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover opacity-90"
                />
              ) : (
                <User className="absolute inset-0 m-auto h-20 w-20 text-stone-700" aria-hidden="true" />
              )}
              <button
                type="button"
                aria-label={`Remove ${match.full_name} from shortlist`}
                onClick={() => onRemoveShortlist(item.id)}
                className="absolute right-2 top-2 rounded-full bg-stone-950/50 p-2 text-white hover:bg-red-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <h3 className="font-serif text-xl text-stone-100">{match.full_name}</h3>
              <button
                type="button"
                onClick={() => onProfileSelect({ ...match, score: 0 })}
                className="mt-4 block w-full rounded-xl bg-stone-100 py-3 text-center text-sm font-bold text-stone-950"
              >
                View Profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
