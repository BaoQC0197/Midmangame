import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import styles from './ChatRoom.module.css';

interface MessageListProps {
    messages: ChatMessage[];
    currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.messageList}>
            {messages.map((msg) => {
                const isSelf = msg.sender_id === currentUserId;
                const isSystem = msg.sender_role === 'system';

                if (isSystem) {
                    return (
                        <div key={msg.id} className={styles.bubbleSystem}>
                            {msg.message}
                        </div>
                    );
                }

                return (
                    <div 
                        key={msg.id} 
                        className={`${styles.messageRow} ${isSelf ? styles.messageRowSelf : styles.messageRowOther}`}
                    >
                        {!isSelf && (
                            <div className={styles.senderInfo}>
                                {!(msg.sender_role === 'midman' && (msg.sender_name === 'Khách hàng' || msg.sender_name === 'User' || !msg.sender_name)) && (
                                    <span className={styles.senderName}>{msg.sender_name || 'User'}</span>
                                )}
                                <span className={`${styles.roleBadge} ${styles[`role${msg.sender_role.charAt(0).toUpperCase() + msg.sender_role.slice(1)}`]}`}>
                                    {msg.sender_role === 'midman' ? 'TRUNG GIAN' : msg.sender_role === 'seller' ? 'Người bán' : 'Người mua'}
                                </span>
                            </div>
                        )}
                        <div className={`${styles.messageBubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther}`}>
                            {msg.message}
                        </div>
                        <span className={styles.timestamp}>{formatTime(msg.created_at)}</span>
                    </div>
                );
            })}
            <div ref={endRef} />
        </div>
    );
}
