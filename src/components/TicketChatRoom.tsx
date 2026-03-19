import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    getTicketMessages,
    sendTicketMessage,
    subscribeToTicketMessages,
    type ChatMessage,
} from '../api/chat';
import { MessageRole } from '../types/chat';
import { updateTicketStatus } from '../api/tickets';
import styles from './TicketChatRoom.module.css';

interface TicketChatRoomProps {
    ticket: {
        id: string;
        account_title?: string;
        price?: number;
        buyer_phone?: string;
        buyer_contact?: string;
        seller_user_id?: string;
        buyer_user_id?: string;
        midman_id?: string;
    };
    onClose: () => void;
    onTicketUpdate?: () => void;
}

// Màu avatar theo role
const ROLE_COLORS: Record<string, string> = {
    midman: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    seller: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    buyer: 'linear-gradient(135deg, #10b981, #065f46)',
    system: 'linear-gradient(135deg, #f59e0b, #d97706)',
};

const ROLE_LABELS: Record<string, string> = {
    midman: 'Trung Gian',
    seller: 'Người Bán',
    buyer: 'Người Mua',
    system: 'Hệ Thống',
};

function formatTime(iso: string) {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function TicketChatRoom({ ticket, onClose, onTicketUpdate }: TicketChatRoomProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentRole, setCurrentRole] = useState<ChatMessage['sender_role']>('buyer');
    const [currentName, setCurrentName] = useState('Khách');
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Xác định userId hiện tại và role trong phiên này
    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return;
            setCurrentUserId(user.id);

            // 1. Fetch profile
            const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle();

            // 2. Determine Role
            let role: MessageRole = 'system';
            
            // Nếu là Admin thì luôn là Midman
            if (user.email === 'admin@easytrade.com' || profile?.role === 'admin') {
                role = 'midman';
            } 
            // Nếu là Midman được gắn cho ticket này hoặc có role hệ thống là midman
            else if (user.id === ticket.midman_id || profile?.role === 'midman') {
                role = 'midman';
            }
            // Nếu là Buyer của ticket
            else if (user.id === ticket.buyer_user_id) {
                role = 'buyer';
            }
            // Nếu là Seller của ticket
            else if (user.id === ticket.seller_user_id) {
                role = 'seller';
            }

            setCurrentRole(role);

            // 3. Determine Name
            let name = profile?.full_name;
            if (!name && (profile?.role === 'midman' || profile?.role === 'admin')) {
                const { data: app } = await supabase.from('midman_applications').select('full_name').eq('user_id', user.id).eq('status', 'approved').maybeSingle();
                if (app?.full_name) name = app.full_name;
            }

            setCurrentName(name || ROLE_LABELS[role] || 'Người dùng');
        });
    }, [ticket]);

    // Fetch messages ban đầu
    const loadMessages = useCallback(async () => {
        const msgs = await getTicketMessages(ticket.id);
        setMessages(msgs);
    }, [ticket.id]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Subscribe Realtime
    useEffect(() => {
        const unsub = subscribeToTicketMessages(ticket.id, (newMsg) => {
            setMessages(prev => {
                // Tránh duplicate
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });
        return unsub;
    }, [ticket.id]);

    // Auto scroll xuống  
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            await sendTicketMessage({
                ticket_id: ticket.id,
                sender_id: currentUserId || '',
                sender_role: currentRole,
                sender_name: currentName,
                message: input.trim(),
            });
            setInput('');
        } catch (e) {
            console.error('Lỗi gửi tin:', e);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleComplete = async () => {
        if (!confirm('Xác nhận hoàn thành giao dịch? Midman sẽ nhận 60% hoa hồng.')) return;
        // Gửi thông báo hệ thống vào phòng chat
        await sendTicketMessage({
            ticket_id: ticket.id,
            sender_id: '',
            sender_role: 'system',
            sender_name: 'Hệ thống EasyTrade',
            message: '✅ Giao dịch đã được Midman xác nhận hoàn thành. Cảm ơn các bên đã tin tưởng EasyTrade!',
        });
        await updateTicketStatus(ticket.id, 'completed');
        onTicketUpdate?.();
        onClose();
    };

    const handleCancel = async () => {
        if (!confirm('Bạn chắc chắn muốn hủy giao dịch này?')) return;
        await sendTicketMessage({
            ticket_id: ticket.id,
            sender_id: '',
            sender_role: 'system',
            sender_name: 'Hệ thống EasyTrade',
            message: '❌ Giao dịch đã bị hủy bởi Midman.',
        });
        await updateTicketStatus(ticket.id, 'cancelled');
        onTicketUpdate?.();
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={styles.chatContainer}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* === HEADER === */}
                    <div className={styles.header}>
                        <ShieldCheck size={22} color="var(--color-primary)" />
                        <div className={styles.headerInfo}>
                            <div className={styles.headerTitle}>
                                Phòng giao dịch: {ticket.account_title || `#${ticket.id.slice(0, 8).toUpperCase()}`}
                            </div>
                            <div className={styles.headerMeta}>
                                <span className={styles.headerBadge}>3-bên bảo mật</span>
                                {ticket.price && (
                                    <span className={styles.headerPrice}>
                                        {ticket.price.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                                <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>
                                    SĐT: {ticket.buyer_phone || ticket.buyer_contact}
                                </span>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            {currentRole === 'midman' && (
                                <>
                                    <button className={styles.btnComplete} onClick={handleComplete}>
                                        ✅ Chốt hoàn thành
                                    </button>
                                    <button className={styles.btnCancel} onClick={handleCancel}>
                                        Hủy
                                    </button>
                                </>
                            )}
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* === BODY === */}
                    <div className={styles.body}>
                        {messages.length === 0 && (
                            <div className={styles.emptyState}>
                                <MessageSquare size={40} />
                                <p>Phòng chat chính thức đã mở.</p>
                                <p style={{ fontSize: 13 }}>
                                    Tất cả tin nhắn được ghi log và bảo vệ bởi EasyTrade.
                                </p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId;
                            const isSystem = msg.sender_role === 'system';

                            if (isSystem) {
                                return (
                                    <div key={msg.id} className={styles.systemRow}>
                                        <div className={`${styles.bubble} ${styles.system}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={`${styles.messageRow} ${isMe ? styles.me : ''}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={styles.avatar}
                                        style={{ background: ROLE_COLORS[msg.sender_role] || '#555' }}
                                        title={ROLE_LABELS[msg.sender_role]}
                                    >
                                        {msg.sender_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>

                                    <div className={styles.messageBubbleWrapper}>
                                        {!isMe && (
                                            <span className={styles.senderName}>
                                                {msg.sender_name} · {ROLE_LABELS[msg.sender_role]}
                                            </span>
                                        )}
                                        <div
                                            className={`${styles.bubble} ${
                                                isMe
                                                    ? styles.me
                                                    : msg.sender_role === 'midman'
                                                    ? styles.midman
                                                    : styles.them
                                            }`}
                                        >
                                            {msg.message}
                                        </div>
                                        <span className={styles.timestamp}>
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={bottomRef} />
                    </div>

                    {/* === INPUT === */}
                    <div className={styles.inputBar}>
                        <div className={styles.myRole}>
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    background: ROLE_COLORS[currentRole]?.split(',')[0]?.replace('linear-gradient(135deg, ', '') || '#a855f7',
                                    display: 'inline-block',
                                }}
                            />
                            Bạn đang nhắn với tư cách: <strong style={{ color: 'white' }}>{ROLE_LABELS[currentRole]}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'flex-end' }}>
                            <textarea
                                ref={textareaRef}
                                className={styles.input}
                                placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                            />
                            <button
                                className={styles.sendBtn}
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
