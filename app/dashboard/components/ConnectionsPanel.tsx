"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Sparkles, User } from "lucide-react";
import type { ConnectedProfile } from "@/types";

interface ConnectionsPanelProps {
  connections: ConnectedProfile[];
}

export default function ConnectionsPanel({ connections }: ConnectionsPanelProps) {
  return (
    <div className="grid gap-4">
      {connections.map((person) => (
        <div
          key={person.id}
          className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-haldi-900/40 bg-gradient-to-r from-stone-900 to-stone-950 p-6 md:flex-row"
        >
          <div className="flex w-full items-center gap-4">
            <div className="h-20 w-20 rounded-full border-2 border-haldi-600/30 p-1" aria-hidden="true">
              <div className="h-full w-full overflow-hidden rounded-full bg-stone-800">
                {person.image_url ? (
                  <Image
                    src={person.image_url}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="m-auto h-8 w-8 text-stone-600" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl text-stone-100">{person.full_name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold text-haldi-500">
                <Sparkles className="h-3 w-3" />
                Connected
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/chat"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-haldi-600 px-5 py-3 font-bold text-stone-950 hover:bg-haldi-500 md:flex-none"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Link>
        </div>
      ))}
    </div>
  );
}
