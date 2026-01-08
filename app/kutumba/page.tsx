"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Users, Check, X, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CollaboratorAcceptPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserEmail(user.email || "");

    // Find all pending invitations where the current user's email is listed as collaborator
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        *,
        inviter:profiles!collaborators_user_id_fkey(full_name, image_url)
      `)
      .eq('collaborator_email', user.email)
      .eq('status', 'pending');

    if (!error && data) {
      setInvites(data);
    }

    setLoading(false);
  };

  const handleResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    const supabase = createClient();

    const { error } = await supabase
      .from('collaborators')
      .update({ status })
      .eq('id', inviteId);

    if (!error) {
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
      
      if (status === 'accepted') {
        // Redirect to dashboard (will show Guardian Mode)
        router.push('/dashboard');
      }
    } else {
      alert("Could not update invitation: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-haldi-500" />
            <h1 className="text-3xl font-serif text-stone-100">Family Invitations</h1>
          </div>
          <p className="text-stone-400">
            You have been invited to help with matchmaking as a Guardian.
          </p>
        </div>

        {invites.length === 0 ? (
          <div className="p-12 bg-stone-900/30 border border-stone-800 rounded-2xl text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-stone-600" />
            <h3 className="text-lg font-serif text-stone-300 mb-2">No Pending Invitations</h3>
            <p className="text-stone-500 text-sm mb-6">
              When someone invites you to collaborate, they'll appear here.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-block px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div 
                key={invite.id} 
                className="p-6 bg-stone-900 border border-stone-800 rounded-2xl hover:border-haldi-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-800 border border-stone-700 overflow-hidden flex-none">
                      {invite.inviter?.image_url ? (
                        <img 
                          src={invite.inviter.image_url} 
                          alt={invite.inviter.full_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600 text-2xl font-serif">
                          {invite.inviter?.full_name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-serif text-stone-100 mb-1">
                        {invite.inviter?.full_name || "Someone"}
                      </h3>
                      <p className="text-stone-400 text-sm mb-3">
                        wants you to help as their <span className="text-haldi-500 font-bold">{invite.role}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Guardian Mode • View-Only Access</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-none">
                    <button
                      onClick={() => handleResponse(invite.id, 'rejected')}
                      className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleResponse(invite.id, 'accepted')}
                      className="px-6 py-3 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center gap-2 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
