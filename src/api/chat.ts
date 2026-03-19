// src/api/chat.ts
import { supabase } from '../lib/supabase';
import type { ChatMessage, SendMessagePayload } from '../types/chat';
export type { ChatMessage, SendMessagePayload };

export async function getTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function sendTicketMessage(payload: SendMessagePayload) {
    const { error } = await supabase
        .from('ticket_messages')
        .insert([payload]);

    if (error) throw error;
}

export function subscribeToTicketMessages(ticketId: string, onMessage: (message: ChatMessage) => void) {
    const channel = supabase
        .channel(`ticket_chat:${ticketId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'ticket_messages',
                filter: `ticket_id=eq.${ticketId}`
            },
            (payload) => {
                onMessage(payload.new as ChatMessage);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

