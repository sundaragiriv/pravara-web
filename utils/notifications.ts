// utils/notifications.ts
// Helper functions to create notifications for user actions

import { createClient } from '@/utils/supabase/client';

/**
 * Trigger a notification when someone sends an interest
 */
async function insertNotification(payload: {
    user_id: string;
    actor_id: string;
    content: string;
    type: string;
    is_read: boolean;
}) {
    try {
        const supabase = createClient();
        const { error } = await supabase.from('notifications').insert(payload);
        if (error) {
            // Log but never throw — notifications are non-critical
            console.warn('[notifications] insert failed:', error.code, error.message);
        }
    } catch (err) {
        console.warn('[notifications] unexpected error:', err);
    }
}

export async function notifyInterestSent(receiverId: string, senderId: string) {
    await insertNotification({
        user_id: receiverId, actor_id: senderId,
        content: 'sent you an interest request',
        type: 'interest_sent', is_read: false,
    });
}

export async function notifyInterestAccepted(receiverId: string, senderId: string) {
    await insertNotification({
        user_id: receiverId, actor_id: senderId,
        content: 'accepted your interest! Start chatting now.',
        type: 'interest_accepted', is_read: false,
    });
}

export async function notifyProfileView(profileOwnerId: string, viewerId: string) {
    await insertNotification({
        user_id: profileOwnerId, actor_id: viewerId,
        content: 'viewed your profile',
        type: 'profile_view', is_read: false,
    });
}

export async function notifyShortlisted(profileOwnerId: string, shortlisterId: string) {
    await insertNotification({
        user_id: profileOwnerId, actor_id: shortlisterId,
        content: 'shortlisted your profile',
        type: 'shortlisted', is_read: false,
    });
}

export async function notifyNewMessage(receiverId: string, senderId: string, messagePreview: string) {
    await insertNotification({
        user_id: receiverId, actor_id: senderId,
        content: `sent you a message: "${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
        type: 'new_message', is_read: false,
    });
}
