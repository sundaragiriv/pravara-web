"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, MessageCircle, Check } from 'lucide-react';

interface ConnectionButtonProps {
    profileId: string;
    initialStatus: 'none' | 'sent' | 'received' | 'connected' | 'rejected';
    onSendInterest: (profileId: string) => Promise<void>;
}

export default function ConnectionButton({ profileId, initialStatus, onSendInterest }: ConnectionButtonProps) {
    const [status, setStatus] = useState(initialStatus || 'none'); // Fallback to 'none' if undefined
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicking the card behind it
        // Prevent clicking if already sent or loading
        if (status !== 'none' && status !== 'connected' && status !== 'received') return;

        if (status === 'connected') {
            // Navigate to chat
            window.location.href = `/chat?user=${profileId}`;
            return;
        }

        if (status === 'none') {
            setLoading(true);
            try {
                await onSendInterest(profileId);
                setStatus('sent'); // Optimistic update (Turn button gray instantly)
            } catch (error) {
                console.error('Failed to send interest:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // --- STATE 1: ALREADY CONNECTED (Chat) ---
    if (status === 'connected') {
        return (
            <button 
                onClick={handleClick}
                className="flex-1 flex items-center justify-center gap-2 bg-green-900/20 border border-green-500/50 text-green-400 py-2.5 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(74,222,128,0.1)] transition-colors hover:bg-green-900/30 whitespace-nowrap"
            >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
            </button>
        );
    }

    // --- STATE 2: INTEREST SENT (The New "Active Waiting" Look) ---
    if (status === 'sent') {
        return (
            <button 
                disabled 
                className="flex-1 flex items-center justify-center gap-2 bg-haldi-900/10 border border-haldi-500/30 text-haldi-600 py-2.5 rounded-xl text-xs font-medium cursor-not-allowed whitespace-nowrap"
            >
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Pending</span>
            </button>
        );
    }

    // --- STATE 3: RECEIVED (They liked YOU) ---
    if (status === 'received') {
        return (
            <button 
                onClick={handleClick}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-stone-200 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-colors animate-pulse whitespace-nowrap"
            >
                <Check className="w-4 h-4" />
                <span>Accept Request</span>
            </button>
        );
    }

    // --- STATE 4: DEFAULT (Send Interest - The 'Priya' Look) ---
    return (
        <motion.button 
            onClick={handleClick}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-haldi-500 to-haldi-600 text-black hover:to-haldi-400 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-haldi-500/20 hover:shadow-haldi-500/40 transition-all disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
        >
            {/* The Heart beats on hover */}
            <motion.div 
                animate={loading ? {} : { scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                <Heart className={`w-4 h-4 ${loading ? 'animate-ping' : 'fill-black'}`} />
            </motion.div>
            <span>{loading ? 'Sending...' : 'Connect'}</span>
        </motion.button>
    );
}
