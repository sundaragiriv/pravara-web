"use client";

import { useState } from "react";
import { Users, Send, Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function KutumbaInvite() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Parent");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInvite = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Check if this email is already a collaborator
      const { data: existing } = await supabase
        .from('collaborators')
        .select('*')
        .eq('user_id', user.id)
        .eq('collaborator_email', email)
        .maybeSingle();

      if (existing) {
        alert("This person is already a collaborator.");
        setLoading(false);
        return;
      }

      // Insert the invitation
      const { error } = await supabase.from('collaborators').insert({
        user_id: user.id,  // YOUR ID (the person being helped)
        collaborator_email: email,  // THEIR EMAIL (the guardian)
        role: role  // Their role (Parent, Sibling, etc.)
      });

      if (!error) {
        setSent(true);
        setEmail("");
        setTimeout(() => setSent(false), 3000);
      } else {
        console.error("Invite Error:", error);
        alert(`Could not send invite: ${error.message}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden group shadow-lg">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Users className="w-24 h-24 text-haldi-500" />
      </div>

      <div className="relative z-10">
        <h3 className="text-haldi-500 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
           <Users className="w-4 h-4" /> The Kutumba Bridge
        </h3>
        <h2 className="text-xl font-serif text-stone-100 mb-2">Invite a Collaborator</h2>
        <p className="text-stone-400 text-sm mb-4 max-w-xs leading-relaxed">
          Let your family help you search. They get a restricted view to shortlist profiles for you, without seeing your private chats.
        </p>

        {!sent ? (
          <div className="space-y-3">
             <input 
               type="email" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Family Member's Email"
               className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-200 focus:border-haldi-500/50 outline-none transition-colors"
             />
             <div className="flex gap-2">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-400 outline-none cursor-pointer"
                >
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Relative</option>
                  <option>Friend</option>
                </select>
                <button 
                  onClick={handleInvite}
                  disabled={loading}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                   Send Invite
                </button>
             </div>
          </div>
        ) : (
          <div className="py-4 bg-green-900/20 border border-green-900 rounded-xl flex items-center justify-center gap-2 text-green-500 font-bold animate-in fade-in zoom-in">
             <Check className="w-5 h-5" /> Invite Sent!
          </div>
        )}
      </div>
    </div>
  );
}
