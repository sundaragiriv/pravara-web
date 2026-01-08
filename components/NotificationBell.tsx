"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
    const supabase = createClient();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetchNotifications();
        subscribeToRealtime();
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*, actor:profiles!actor_id(full_name, profile_photo_url)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
        
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
    };

    const subscribeToRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        supabase
            .channel('realtime-notifications')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    // Flash update!
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Optional: Play a sound here
                    // new Audio('/ping.mp3').play();
                }
            )
            .subscribe();
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user?.id)
            .eq('is_read', false);
            
        setUnreadCount(0);
    };

    const getNotificationTime = (timestamp: string) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now.getTime() - notifTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifTime.toLocaleDateString();
    };

    return (
        <div className="relative z-50">
            {/* THE BELL ICON - Keep it clean and sharp */}
            <button 
                onClick={() => { setIsOpen(!isOpen); markAsRead(); }}
                className="relative p-2 text-stone-400 hover:text-haldi-500 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border border-stone-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <>
                    {/* Backdrop to close on click */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-2 w-80 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* BRAND THE HEADER "NARADA" */}
                        <div className="p-4 border-b border-stone-800 bg-gradient-to-r from-stone-900 to-stone-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🪕</span>
                                <h4 className="text-sm font-serif font-bold text-haldi-500">Narada's Updates</h4>
                            </div>
                            {unreadCount > 0 && (
                                <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                /* THEMATIC EMPTY STATE */
                                <div className="p-8 text-center flex flex-col items-center opacity-50">
                                    <Bell className="w-8 h-8 text-stone-600 mb-2" />
                                    <p className="text-stone-400 text-xs italic">
                                        "Narada has no news for you yet."
                                    </p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-3 border-b border-stone-800 flex gap-3 hover:bg-stone-800/50 transition-colors cursor-pointer ${
                                            !notif.is_read ? 'bg-haldi-900/10 border-l-2 border-l-haldi-500' : ''
                                        }`}
                                    >
                                        {/* Actor Image with System Notification Logic */}
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-700 flex-shrink-0">
                                            {notif.type === 'system' ? (
                                                /* System notification shows Narada */
                                                <div className="w-full h-full bg-haldi-500 flex items-center justify-center p-1">
                                                    <span className="text-2xl">🪕</span>
                                                </div>
                                            ) : notif.actor?.profile_photo_url ? (
                                                <img 
                                                    src={notif.actor.profile_photo_url} 
                                                    alt={notif.actor.full_name}
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                                                    <Bell className="w-5 h-5 text-stone-600" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-stone-200 leading-snug">
                                                {notif.type === 'system' ? (
                                                    <span className="font-bold text-haldi-500">Narada</span>
                                                ) : (
                                                    <span className="font-bold text-haldi-500">
                                                        {notif.actor?.full_name || "Someone"}
                                                    </span>
                                                )}{' '}
                                                <span className="text-stone-300">{notif.content}</span>
                                            </p>
                                            <span className="text-[10px] text-stone-500 mt-1 block">
                                                {getNotificationTime(notif.created_at)}
                                            </span>
                                        </div>
                                        
                                        {/* Unread Indicator */}
                                        {!notif.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-haldi-500 flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {notifications.length > 0 && (
                            <div className="p-2 border-t border-stone-800 bg-black/20">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-xs text-stone-400 hover:text-haldi-400 py-1.5 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
