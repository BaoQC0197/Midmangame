import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ShieldCheck, ChevronLeft, Package, MessageSquare } from 'lucide-react';
import type { TransactionTicket, TicketChecklist } from '../types/ticket';
import type { MessageRole } from '../types/chat';
import TradeMachine from './TradeMachine';
import ChatRoom from './ChatRoom';
import styles from './TradeRoomView.module.css';

interface TradeRoomViewProps {
    ticket: TransactionTicket;
    user: any;
    userProfile: any;
    onClose: () => void;
}

export default function TradeRoomView({ ticket, user, userProfile, onClose }: TradeRoomViewProps) {
    const [currentTicket, setCurrentTicket] = useState<TransactionTicket>(ticket);

    // Đồng bộ với prop khi nó thay đổi từ bên ngoài
    useEffect(() => {
        setCurrentTicket(ticket);
    }, [ticket]);

    // Đăng ký realtime cho riêng ticket này để cập nhật tiến độ tức thì
    useEffect(() => {
        // Fetch dữ liệu mới nhất một lần khi mount để đảm bảo không bị stale
        const fetchLatest = async () => {
            const { data, error } = await supabase
                .from('transaction_tickets')
                .select('*')
                .eq('id', ticket.id)
                .single();
            if (data && !error) {
                setCurrentTicket(data as TransactionTicket);
            }
        };

        fetchLatest();

        const channel = supabase
            .channel(`ticket_room_${ticket.id}`)
            .on(
                'postgres_changes',
                { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'transaction_tickets',
                    filter: `id=eq.${ticket.id}` 
                },
                (payload) => {
                    console.log('Ticket updated realtime:', payload.new);
                    setCurrentTicket(payload.new as TransactionTicket);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [ticket.id]);

    const checklistItems = [
        { key: 'identity_verified', label: 'Xác minh Buyer/Seller' },
        { key: 'buyer_paid', label: 'Buyer chuyển tiền trung gian' },
        { key: 'seller_delivered', label: 'Seller bàn giao Account' },
        { key: 'buyer_confirmed', label: 'Buyer xác nhận & Đổi pass' },
        { key: 'seller_received_payment', label: 'Giải ngân cho Seller' }
    ];

    // Xác định vai trò người dùng
    const getRole = (): MessageRole => {
        if (!user) return 'system';
        // Nếu là buyer/seller theo ticket thì hiện role đó
        if (user.id === currentTicket.buyer_user_id) return 'buyer';
        if (user.id === currentTicket.seller_user_id) return 'seller';
        
        // Nếu là Admin hoặc Midman hệ thống
        if (user.email === 'admin@easytrade.com' || userProfile?.role === 'admin' || userProfile?.role === 'midman' || user.id === currentTicket.midman_id) return 'midman';
        
        return 'system';
    };

    const userRole = getRole();

    const toggleChecklist = async (key: string) => {
        if (userRole !== 'midman') {
            console.warn('Role is not midman, cannot toggle checklist. Current Role:', userRole);
            return;
        }
        
        // Nếu đã giải ngân (bước cuối), khóa toàn bộ không cho sửa nữa
        if (currentTicket.checklist?.seller_received_payment) {
            alert('Giao dịch đã được giải ngân và hoàn tất. Không thể thay đổi tiến độ.');
            return;
        }

        // Nếu là bước giải ngân cho seller, yêu cầu xác nhận kỹ
        if (key === 'seller_received_payment') {
            const confirmed = window.confirm(
                'XÁC NHẬN GIẢI NGÂN CHO NGƯỜI BÁN?\n\n' +
                'Lưu ý: Hành động này sẽ chuyển trạng thái giao dịch thành hoàn tất và KHÓA mọi thay đổi tiến độ sau này.'
            );
            if (!confirmed) return;
        }
        
        console.log('Toggling checklist item:', key);
        const currentChecklist = currentTicket.checklist || {} as TicketChecklist;
        const newChecklist = {
            ...currentChecklist,
            [key]: !((currentChecklist as any)[key])
        };

        try {
            const { error } = await supabase
                .from('transaction_tickets')
                .update({ 
                    checklist: newChecklist,
                    // Nếu giải ngân thì cập nhật luôn status ticket sang completed
                    ...(key === 'seller_received_payment' ? { status: 'completed', completed_at: new Date().toISOString() } : {})
                })
                .eq('id', currentTicket.id);

            if (error) throw error;
            console.log('Checklist updated successfully in DB');
            
            // Cập nhật local state ngay lập tức (optimistic update)
            setCurrentTicket(prev => ({
                ...prev,
                checklist: newChecklist as any,
                ...(key === 'seller_received_payment' ? { status: 'completed' } : {})
            }));
        } catch (err) {
            console.error('Lỗi khi cập nhật tiến độ:', err);
        }
    };

    return (
        <motion.div 
            className={styles.roomWrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={onClose}>
                    <ChevronLeft size={18} /> Quay lại sàn
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: 1 }}>LIVE TRADE SESSION</span>
                </div>
            </header>

            <main className={styles.roomContent}>
                <div className={styles.titleArea}>
                    <h1 className={`${styles.roomTitle} text-gradient`}>Phòng Giao Dịch Trung Gian</h1>
                    <p className={styles.roomSub}>Tài khoản: <b>{currentTicket.account_title}</b> • Mã giao dịch: #{currentTicket.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className={styles.gridContent}>
                    {/* Visual Machine & Chat Area */}
                    <div className={styles.mainWorkArea}>
                        <div className={styles.machineWrapper}>
                            <TradeMachine 
                                checklist={currentTicket.checklist} 
                                statusLabel={currentTicket.status === 'completed' ? 'Giao dịch hoàn tất' : 'Đang xử lý dữ liệu...'} 
                            />
                        </div>
                        
                        <div className={styles.chatSection}>
                            <ChatRoom 
                                ticketId={currentTicket.id}
                                userId={user?.id || ''}
                                userName={userProfile?.full_name || userProfile?.display_name || user?.email?.split('@')[0] || 'User'}
                                userRole={userRole}
                            />
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className={styles.infoSidebar}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <ShieldCheck size={18} /> Tiến độ giao dịch
                            </div>
                            <div className={styles.checklist}>
                                {checklistItems.map((item) => {
                                    const isDone = !!((currentTicket.checklist || {}) as any)[item.key];
                                    const isInteractive = userRole === 'midman';
                                    return (
                                        <div 
                                            key={item.key} 
                                            className={`${styles.checkItem} ${isDone ? styles.done : ''} ${isInteractive ? styles.interactive : ''}`}
                                            onClick={() => isInteractive && toggleChecklist(item.key)}
                                            title={isInteractive ? 'Click để cập nhật tiến độ' : ''}
                                        >
                                            <div className={styles.checkIcon}>
                                                {isDone && <ShieldCheck size={12} />}
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle} style={{ color: 'var(--color-primary)' }}>
                                <Package size={18} /> Thông tin tài khoản
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-dim)' }}>Giá trị:</span>
                                    <b>{currentTicket.account_price?.toLocaleString()}đ</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-dim)' }}>Trạng thái:</span>
                                    <b style={{ color: 'var(--color-accent)' }}>Ưu tiên bảo mật</b>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle} style={{ color: '#ef4444' }}>
                                <MessageSquare size={18} /> Lưu ý giao dịch
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
                                • Không chia sẻ mã OTP hoặc thông tin nhạy cảm ngoài khung chat.<br/>
                                • Mọi bước bàn giao phải có sự chứng kiến của Midman.<br/>
                                • Chat log được ghi lại để giải quyết tranh chấp.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
}
