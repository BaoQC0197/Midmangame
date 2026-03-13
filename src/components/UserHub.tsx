import { X, Package, ShoppingBag, Gift } from 'lucide-react';
import styles from './UserHub.module.css';
import { getUserAccounts } from '../api/accounts';
import { getUserBuyRequests } from '../api/tickets';
import { getProfile } from '../api/profiles';
import SpinWheel from './SpinWheel';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserHubProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

export default function UserHub({ open, onClose, userId }: UserHubProps) {
    const [activeTab, setActiveTab] = useState<'listings' | 'buys'>('listings');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [buyRequests, setBuyRequests] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Spin state
    const [selectedAccountForSpin, setSelectedAccountForSpin] = useState<any>(null);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [accs, buys, prof] = await Promise.all([
                getUserAccounts(userId),
                getUserBuyRequests(userId),
                getProfile(userId)
            ]);
            setAccounts(accs);
            setBuyRequests(buys);
            setProfile(prof);
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
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: 100 }}>
                            <div className="spinner" style={{ margin: '0 auto 20px' }} />
                            <p style={{ color: 'var(--color-text-dim)' }}>Đang kết nối dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            {profile && profile.spin_turns > 0 && activeTab === 'listings' && (
                                <div className={styles.spinBadge}>
                                    <Gift size={18} />
                                    <span>Bạn đang có {profile.spin_turns} lượt quay Hot Account!</span>
                                </div>
                            )}

                            {activeTab === 'listings' ? (
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
                                                    <a href={ticket.room_url} target="_blank" rel="noreferrer" className="btn-action" style={{ padding: '8px 12px', fontSize: 12, textDecoration: 'none' }}>
                                                        VÀO PHÒNG
                                                    </a>
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
        </>
    );
}
