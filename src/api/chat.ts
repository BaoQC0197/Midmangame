import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id: string;
    ticket_id: string;
    sender_id: string | null;
    sender_role: 'buyer' | 'seller' | 'midman' | 'system';
    sender_name: string;
    message: string;
    created_at: string;
}

export async function getTicketMessages(ticketId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Lỗi fetch messages:', error);
        return [];
    }
    return (data as ChatMessage[]) || [];
}

export async function sendMessage(params: {
    ticketId: string;
    senderId: string | null;
    senderRole: ChatMessage['sender_role'];
    senderName: string;
    message: string;
}) {
    const { error } = await supabase
        .from('ticket_messages')
        .insert([{
            ticket_id: params.ticketId,
            sender_id: params.senderId,
            sender_role: params.senderRole,
            sender_name: params.senderName,
            message: params.message.trim(),
        }]);

    if (error) throw error;
}

export function subscribeToTicketMessages(
    ticketId: string,
    onMessage: (msg: ChatMessage) => void
) {
    const channel = supabase
        .channel(`ticket_chat_${ticketId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'ticket_messages',
                filter: `ticket_id=eq.${ticketId}`,
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
