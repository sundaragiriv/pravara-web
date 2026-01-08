// utils/notifications.ts
// Helper functions to create notifications for user actions

import { createClient } from '@/utils/supabase/client';

/**
 * Trigger a notification when someone sends an interest
 */
export async function notifyInterestSent(receiverId: string, senderId: string) {
    const supabase = createClient();
    
    await supabase.from('notifications').insert({
        user_id: receiverId,
        actor_id: senderId,
        content: 'sent you an interest request',
        type: 'interest_sent',
        is_read: false
    });
}

/**
 * Trigger a notification when someone accepts an interest
 */
export async function notifyInterestAccepted(receiverId: string, senderId: string) {
    const supabase = createClient();
    
    await supabase.from('notifications').insert({
        user_id: receiverId,
        actor_id: senderId,
        content: 'accepted your interest! Start chatting now.',
        type: 'interest_accepted',
        is_read: false
    });
}

/**
 * Trigger a notification when someone views your profile
 */
export async function notifyProfileView(profileOwnerId: string, viewerId: string) {
    const supabase = createClient();
    
    await supabase.from('notifications').insert({
        user_id: profileOwnerId,
        actor_id: viewerId,
        content: 'viewed your profile',
        type: 'profile_view',
        is_read: false
    });
}

/**
 * Trigger a notification when someone shortlists you
 */
export async function notifyShortlisted(profileOwnerId: string, shortlisterId: string) {
    const supabase = createClient();
    
    await supabase.from('notifications').insert({
        user_id: profileOwnerId,
        actor_id: shortlisterId,
        content: 'shortlisted your profile',
        type: 'shortlisted',
        is_read: false
    });
}

/**
 * Trigger a notification when someone sends a message
 */
export async function notifyNewMessage(receiverId: string, senderId: string, messagePreview: string) {
    const supabase = createClient();
    
    await supabase.from('notifications').insert({
        user_id: receiverId,
        actor_id: senderId,
        content: `sent you a message: "${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
        type: 'new_message',
        is_read: false
    });
}
