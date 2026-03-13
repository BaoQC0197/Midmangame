import { motion } from 'framer-motion';
import { Video, ShieldCheck, ChevronLeft, Package } from 'lucide-react';
import type { TransactionTicket } from '../types/ticket';
import TradeMachine from './TradeMachine';
import styles from './TradeRoomView.module.css';

interface TradeRoomViewProps {
    ticket: TransactionTicket;
    onClose: () => void;
}

export default function TradeRoomView({ ticket, onClose }: TradeRoomViewProps) {
    const checklistItems = [
        { key: 'verified', label: 'Xác minh Buyer/Seller' },
        { key: 'buyer_paid', label: 'Buyer chuyển tiền trung gian' },
        { key: 'seller_delivered', label: 'Seller bàn giao Account' },
        { key: 'buyer_confirmed', label: 'Buyer xác nhận & Đổi pass' },
        { key: 'disbursed', label: 'Giải ngân cho Seller' }
    ];

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
                    <p className={styles.roomSub}>Tài khoản: <b>{ticket.account_title}</b> • Mã giao dịch: #{ticket.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className={styles.gridContent}>
                    {/* Visual Machine Area */}
                    <div style={{ width: '100%' }}>
                        <TradeMachine 
                            checklist={ticket.checklist} 
                            statusLabel={ticket.status === 'completed' ? 'Giao dịch hoàn tất' : 'Đang xử lý dữ liệu...'} 
                        />
                    </div>

                    {/* Sidebar Area */}
                    <div className={styles.infoSidebar}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <ShieldCheck size={18} /> Tiến độ giao dịch
                            </div>
                            <div className={styles.checklist}>
                                {checklistItems.map((item) => {
                                    const isDone = !!ticket.checklist?.[item.key as keyof typeof ticket.checklist];
                                    return (
                                        <div key={item.key} className={`${styles.checkItem} ${isDone ? styles.done : ''}`}>
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
                            <div className={styles.cardTitle} style={{ color: '#ef4444' }}>
                                <Video size={18} /> Phòng đàm phán Jitsi
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 20 }}>
                                Admin đang chờ bạn trong phòng họp video để hướng dẫn bàn giao account.
                            </p>
                            {ticket.room_url ? (
                                <a href={ticket.room_url} target="_blank" rel="noreferrer" className={styles.joinBtn}>
                                    <Video size={20} /> Vào phòng ngay
                                </a>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 13, padding: 10, border: '1px dashed #334155', borderRadius: 10 }}>
                                    Đang khởi tạo phòng họp...
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardTitle} style={{ color: 'var(--color-primary)' }}>
                                <Package size={18} /> Thông tin tài khoản
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-dim)' }}>Giá trị:</span>
                                    <b>{ticket.account_price?.toLocaleString()}đ</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-dim)' }}>Trạng thái:</span>
                                    <b style={{ color: 'var(--color-accent)' }}>Ưu tiên bảo mật</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{ padding: 40, textAlign: 'center', opacity: 0.5, fontSize: 12 }}>
                Mọi hành vi trao đổi ngoài hệ thống EasyTrade sẽ không được bảo hộ.
            </footer>
        </motion.div>
    );
}
