import { X, Package, ShoppingBag, Gift } from 'lucide-react';
import styles from './UserHub.module.css';
import { getUserAccounts } from '../api/accounts';
import { getUserBuyRequests, getMidmanCompletedTickets, getMidmanPendingRequests, updateTicketStatus } from '../api/tickets';
import { getProfile } from '../api/profiles';
import TicketChatRoom from './TicketChatRoom';
import SpinWheel from './SpinWheel';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserHubProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

export default function UserHub({ open, onClose, userId }: UserHubProps) {
    const [activeTab, setActiveTab] = useState<'listings' | 'buys' | 'midman_history' | 'midman_pending'>('listings');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [buyRequests, setBuyRequests] = useState<any[]>([]);
    const [midmanTickets, setMidmanTickets] = useState<any[]>([]);
    const [midmanPending, setMidmanPending] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChatTicket, setSelectedChatTicket] = useState<any | null>(null);
    
    // Spin state
    const [selectedAccountForSpin, setSelectedAccountForSpin] = useState<any>(null);

    const refreshData = async () => {
        setLoading(true);
        try {
            const prof = await getProfile(userId);
            setProfile(prof);

            if (prof && prof.role === 'midman') {
                setActiveTab('midman_pending');
                const [midmanHistory, pendingList] = await Promise.all([
                    getMidmanCompletedTickets(userId),
                    getMidmanPendingRequests(userId)
                ]);
                setMidmanTickets(midmanHistory);
                setMidmanPending(pendingList);
            } else {
                const [accs, buys] = await Promise.all([
                    getUserAccounts(userId),
                    getUserBuyRequests(userId)
                ]);
                setAccounts(accs);
                setBuyRequests(buys);
            }
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu UserHub:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && userId) {
            refreshData();
        }
    }, [open, userId]);

    if (!open) return null;

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                onClick={onClose}
            />
            
            <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={styles.sidebar}
            >
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: 10, background: 'rgba(168, 85, 247, 0.1)', borderRadius: 12 }}>
                            <ShoppingBag className="text-primary" size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Trung tâm của tôi</h2>
                    </div>
                    <button className="btn-action" onClick={onClose} style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.tabs}>
                    {profile && profile.role === 'midman' ? (
                        <>
                            <button 
                                className={`${styles.tab} ${activeTab === 'midman_pending' ? styles.active : ''}`}
                                onClick={() => setActiveTab('midman_pending')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ShoppingBag size={18} />
                                    <span>Đang giao dịch ( <strong style={{ color: 'var(--color-primary)' }}>{midmanPending.length}</strong> )</span>
                                </div>
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'midman_history' ? styles.active : ''}`}
                                onClick={() => setActiveTab('midman_history')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Package size={18} />
                                    Lịch sử nhận hoa hồng
                                </div>
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className={`${styles.tab} ${activeTab === 'listings' ? styles.active : ''}`}
                                onClick={() => setActiveTab('listings')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Package size={18} />
                                    Tài khoản rao bán
                                </div>
                            </button>
                            <button 
                                className={`${styles.tab} ${activeTab === 'buys' ? styles.active : ''}`}
                                onClick={() => setActiveTab('buys')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ShoppingBag size={18} />
                                    Yêu cầu mua
                                </div>
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: 100 }}>
                            <div className="spinner" style={{ margin: '0 auto 20px' }} />
                            <p style={{ color: 'var(--color-text-dim)' }}>Đang kết nối dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            {profile && profile.spin_turns > 0 && activeTab === 'listings' && profile.role !== 'midman' && (
                                <div className={styles.spinBadge}>
                                    <Gift size={18} />
                                    <span>Bạn đang có {profile.spin_turns} lượt quay Hot Account!</span>
                                </div>
                            )}

                            {activeTab === 'midman_pending' ? (
                                <div className={styles.accountList}>
                                    {midmanPending.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: 50, color: 'var(--color-text-dim)' }}>
                                            Hiện tại chưa có người mua nào gọi tên bạn giao dịch.
                                        </div>
                                    ) : (
                                        midmanPending.map(ticket => (
                                            <div key={ticket.id} className={styles.accountItem}>
                                                <img src={ticket.account_thumbnail} alt="" className={styles.thumb} />
                                                <div className={styles.info}>
                                                    <div className={styles.title}>{ticket.account_title || `Ticket ${ticket.id.slice(0, 8)}`}</div>
                                                    <div className={styles.meta}>
                                                        <span>Giá: {ticket.price?.toLocaleString()}đ</span>
                                                    </div>
                                                    <div style={{ marginTop: 6, fontSize: 12, color: 'white', opacity: 0.8 }}>
                                                        SĐT Mua: {ticket.buyer_contact}
                                                    </div>
                                                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: ticket.status === 'trading' ? 'var(--color-primary)' : '#f59e0b' }}>
                                                        {ticket.status === 'pending_match' ? 'Chưa nhận kèo / Chờ phản hồi' : 'Đang trong phòng giao dịch'}
                                                    </div>
                                                </div>
                                                <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {ticket.status === 'pending_match' && (
                                                        <button 
                                                            className="btn-premium"
                                                            style={{ padding: '8px', fontSize: 12 }}
                                                            onClick={async () => {
                                                                await updateTicketStatus(ticket.id, 'matched');
                                                                refreshData();
                                                            }}
                                                        >
                                                            Nhận Kèo
                                                        </button>
                                                    )}
                                                    {ticket.status === 'matched' && (
                                                        <button 
                                                            className="btn-premium"
                                                            style={{ padding: '8px', fontSize: 12 }}
                                                            onClick={async () => {
                                                                await updateTicketStatus(ticket.id, 'trading');
                                                                refreshData();
                                                            }}
                                                        >
                                                            Mở Phòng Dịch Vụ
                                                        </button>
                                                    )}
                                                    {ticket.status === 'trading' && (
                                                        <>
                                                            <button 
                                                                className="btn-action"
                                                                style={{ padding: '8px', fontSize: 12, background: 'rgba(52, 211, 153, 0.1)', color: 'var(--color-success)' }}
                                                                onClick={() => setSelectedChatTicket(ticket)}
                                                            >
                                                                Vào Chat 3 Bên
                                                            </button>
                                                            <button 
                                                                className="btn-premium"
                                                                style={{ padding: '8px', fontSize: 12, background: 'var(--color-success)', color: 'black' }}
                                                                onClick={async () => {
                                                                    if (confirm('Xác nhận hoàn thành giao dịch này? Bạn sẽ nhận 60% Hoa hồng vào Lịch sử.')) {
                                                                        await updateTicketStatus(ticket.id, 'completed');
                                                                        refreshData();
                                                                    }
                                                                }}
                                                            >
                                                                Chốt Thành Công
                                                            </button>
                                                        </>
                                                    )}
                                                    <button 
                                                        style={{ padding: '8px', fontSize: 12, border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer' }}
                                                        onClick={async () => {
                                                            if (confirm('Bạn chắc chắn Hủy/Từ chối phục vụ giao dịch này?')) {
                                                                await updateTicketStatus(ticket.id, 'cancelled');
                                                                refreshData();
                                                            }
                                                        }}
                                                    >
                                                        Huỷ Bỏ
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : activeTab === 'midman_history' ? (
                                <div className={styles.accountList}>
                                    {midmanTickets.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: 50, color: 'var(--color-text-dim)' }}>
                                            Chưa có giao dịch trung gian nào được ghi nhận hoàn thành.
                                        </div>
                                    ) : (
                                        midmanTickets.map(ticket => {
                                            const midmanFee = (ticket.fee || 0) * 0.6; // 60% tổng phí
                                            return (
                                                <div key={ticket.id} className={styles.accountItem} style={{ borderLeft: '4px solid var(--color-success)' }}>
                                                    <img src={ticket.account_thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'} alt="" className={styles.thumb} />
                                                    <div className={styles.info}>
                                                        <div className={styles.title}>{ticket.account_title || `Ticket #${ticket.id.slice(0, 8)}`}</div>
                                                        <div className={styles.meta}>
                                                            <span style={{ color: 'var(--color-text-dim)' }}>
                                                                Hoàn thành: {ticket.completed_at ? new Date(ticket.completed_at).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div style={{ marginTop: 8, padding: '8px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>Tổng phí: {ticket.fee?.toLocaleString()}đ</span>
                                                            <strong>
                                                                <span style={{ fontSize: 13, color: 'var(--color-text-dim)', marginRight: 6 }}>Nhận (60%):</span>
                                                                <span style={{ color: 'var(--color-success)', fontSize: 16 }}>+{midmanFee.toLocaleString()}đ</span>
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            ) : activeTab === 'listings' ? (
                                <div className={styles.accountList}>
                                    {accounts.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: 50, color: 'var(--color-text-dim)' }}>
                                            Bạn chưa đăng bán tài khoản nào.
                                        </div>
                                    ) : (
                                        accounts.map(acc => (
                                            <div key={acc.id} className={styles.accountItem}>
                                                <img src={acc.thumbnail} alt="" className={styles.thumb} />
                                                <div className={styles.info}>
                                                    <div className={styles.title}>{acc.title}</div>
                                                    <div className={styles.meta}>
                                                        <span>{acc.price.toLocaleString()}đ</span>
                                                        <span className={`${styles.status} ${styles[acc.status]}`}>
                                                            {acc.status === 'approved' ? 'Đã duyệt' : acc.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.actions}>
                                                    {profile?.spin_turns > 0 && acc.status === 'approved' && !acc.is_sold && acc.promotion !== 'Hot' && (
                                                        <button 
                                                            className="btn-premium"
                                                            style={{ padding: '8px 12px', fontSize: 12 }}
                                                            onClick={() => setSelectedAccountForSpin(acc)}
                                                        >
                                                            Quay Hot
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className={styles.accountList}>
                                    {buyRequests.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: 50, color: 'var(--color-text-dim)' }}>
                                            Bạn chưa đặt mua tài khoản nào.
                                        </div>
                                    ) : (
                                        buyRequests.map(ticket => (
                                            <div key={ticket.id} className={styles.accountItem}>
                                                <img src={ticket.account_thumbnail} alt="" className={styles.thumb} />
                                                <div className={styles.info}>
                                                    <div className={styles.title}>{ticket.account_title}</div>
                                                    <div className={styles.meta}>
                                                        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{ticket.account_price?.toLocaleString()}đ</span>
                                                        <span style={{ color: 'var(--color-text-dim)' }}>
                                                            {new Date(ticket.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: 'white', opacity: 0.8 }}>
                                                        TRẠNG THÁI: {ticket.status.toUpperCase()}
                                                    </div>
                                                </div>
                                                {ticket.status === 'trading' && (
                                                    <button 
                                                        className="btn-action" 
                                                        style={{ padding: '8px 12px', fontSize: 12, border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: 8, cursor: 'pointer' }}
                                                        onClick={() => setSelectedChatTicket(ticket)}
                                                    >
                                                        VÀO PHÒNG CHAT
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>

            {/* Spin Wheel Modal */}
            <AnimatePresence>
                {selectedAccountForSpin && profile && (
                    <SpinWheel 
                        userId={userId}
                        accountId={selectedAccountForSpin.id}
                        accountTitle={selectedAccountForSpin.title}
                        accountThumb={selectedAccountForSpin.thumbnail}
                        spinTurns={profile.spin_turns}
                        onClose={() => setSelectedAccountForSpin(null)}
                        onSuccess={() => {
                            refreshData();
                        }}
                    />
                )}
            </AnimatePresence>

            {selectedChatTicket && (
                <TicketChatRoom 
                    ticket={selectedChatTicket}
                    onClose={() => setSelectedChatTicket(null)}
                    onTicketUpdate={refreshData}
                />
            )}
        </>
    );
}
