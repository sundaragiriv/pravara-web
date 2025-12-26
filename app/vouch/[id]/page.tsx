"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldCheck, HeartHandshake } from "lucide-react";

export default function VouchPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Friend");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const supabase = createClient();
    const { error } = await supabase.from('endorsements').insert({
        profile_id: id,
        endorser_name: name,
        relation: relation,
        comment: comment
    });

    if (!error) setSubmitted(true);
  };

  if (submitted) {
    return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-serif text-stone-100 mb-2">Thank You!</h1>
            <p className="text-stone-400 max-w-md">Your endorsement has been added to the Varaahi Trust Circle. You have helped build trust in the community.</p>
            <button onClick={() => router.push("/")} className="mt-8 text-haldi-500 font-bold hover:underline">Go to Home</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-haldi-900/20 text-haldi-500 mb-4">
                <HeartHandshake className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif text-stone-100">Vouch for a Friend</h1>
            <p className="text-stone-500 text-sm mt-2">Your words help verify this profile for the Pravara community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Your Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-green-500/50 outline-none" placeholder="e.g. Anjali Rao" />
            </div>
            <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Relationship</label>
                <select value={relation} onChange={e => setRelation(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 outline-none">
                    <option>Friend</option>
                    <option>Sibling</option>
                    <option>Parent</option>
                    <option>Colleague</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">Endorsement</label>
                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-200 focus:border-green-500/50 outline-none" placeholder="What makes them a good match?" />
            </div>

            <button type="submit" className="w-full py-3 mt-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20">
                Submit Vouch
            </button>
        </form>
      </div>
    </div>
  );
}
