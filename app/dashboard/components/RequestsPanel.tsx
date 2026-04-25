"use client";

import Image from "next/image";
import { Check, User, X } from "lucide-react";
import type { RequestItem } from "@/types";

interface RequestsPanelProps {
  requests: RequestItem[];
  onRespond: (connectionId: string, status: "accepted" | "rejected") => void;
}

export default function RequestsPanel({ requests, onRespond }: RequestsPanelProps) {
  if (requests.length === 0) {
    return <div className="py-10 text-center italic text-stone-500">No pending requests.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-stone-800">
              {request.sender.image_url ? (
                <Image
                  src={request.sender.image_url}
                  alt={request.sender.full_name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="m-auto h-8 w-8 text-stone-600" />
              )}
            </div>
            <div>
              <h4 className="font-serif text-lg text-stone-100">{request.sender.full_name}</h4>
              <p className="text-sm text-stone-500">{request.sender.profession}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Decline request"
              onClick={() => onRespond(request.id, "rejected")}
              className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-stone-400 hover:text-red-400"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onRespond(request.id, "accepted")}
              className="flex items-center gap-2 rounded-xl bg-haldi-600 px-6 py-3 font-bold text-stone-950 hover:bg-haldi-500"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
