// src/types/chat.ts

export type MessageRole = 'buyer' | 'seller' | 'midman' | 'system';

export interface ChatMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    sender_name?: string;
    sender_role: MessageRole;
    message: string;
    created_at: string;
}

export interface SendMessagePayload {
    ticket_id: string;
    sender_id: string;
    sender_name?: string;
    sender_role: MessageRole;
    message: string;
}

