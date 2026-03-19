import { useState, useEffect } from 'react';
import { getTicketMessages, sendTicketMessage, subscribeToTicketMessages } from '../api/chat';
import type { ChatMessage, MessageRole } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './ChatRoom.module.css';

interface ChatRoomProps {
    ticketId: string;
    userId: string;
    userName?: string;
    userRole: MessageRole;
}

export default function ChatRoom({ ticketId, userId, userName, userRole }: ChatRoomProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load initial messages
        getTicketMessages(ticketId).then((data) => {
            setMessages(data);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load chat messages:', err);
            setLoading(false);
        });

        // Subscribe to new messages
        const subscription = subscribeToTicketMessages(ticketId, (newMsg) => {
            setMessages((prev) => {
                // Prevent duplicate messages if Realtime sends back what we just inserted
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });

        return () => {
            subscription();
        };
    }, [ticketId]);

    const handleSendMessage = async (message: string) => {
        try {
            await sendTicketMessage({
                ticket_id: ticketId,
                sender_id: userId,
                sender_name: userName,
                sender_role: userRole,
                message: message
            });
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    if (loading) {
        return <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>Đang tải tin nhắn...</div>;
    }

    return (
        <div className={styles.container}>
            <MessageList messages={messages} currentUserId={userId} />
            <MessageInput onSend={handleSendMessage} />
        </div>
    );
}
