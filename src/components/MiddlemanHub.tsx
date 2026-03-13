// src/components/MiddlemanHub.tsx
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
    User, 
    Ticket, LayoutDashboard, Package, X, PlusCircle, Users, Trash2
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_STRUCTURE } from '../types/account';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '../types/ticket';
import type { TradeAccount } from '../types/account';
import type { TransactionTicket } from '../types/ticket';
import { approveAccount, deleteAccount } from '../api/accounts';
import { getTickets, updateTicketStatus } from '../api/tickets';
import { getProfiles, updateSpinTurns, UserProfile } from '../api/profiles';
import styles from './MiddlemanHub.module.css';

interface MiddlemanHubProps {
    open: boolean;
    onClose: () => void;
    accounts: TradeAccount[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type Tab = 'dashboard' | 'sell_requests' | 'buy_requests' | 'users' | 'categories';

export default function MiddlemanHub({ open, onClose, accounts, showToast }: MiddlemanHubProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [tickets, setTickets] = useState<TransactionTicket[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadTickets = useCallback(async () => {
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (error: any) {
            console.error('Error loading tickets:', error);
            showToast('Không thể tải danh sách ticket', 'error');
        }
    }, [showToast]);

    const loadProfiles = useCallback(async () => {
        try {
            const data = await getProfiles();
            console.log('Loaded profiles:', data); // Log để kiểm tra dữ liệu
            setProfiles(data);
        } catch (error: any) {
            console.error('Error loading profiles:', error);
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadTickets();
            loadProfiles();
        }
    }, [open, loadTickets, loadProfiles]);

    const handleUpdateSpinTurns = async (userId: string, turns: number) => {
        try {
            await updateSpinTurns(userId, turns);
            showToast('Đã cập nhật lượt quay!');
            loadProfiles();
        } catch {
            showToast('Lỗi khi cập nhật lượt quay', 'error');
        }
    };

    const filteredProfiles = profiles.filter(p => {
        const email = p.email || '';
        const search = userSearch.toLowerCase();
        return email.toLowerCase().includes(search) || p.id.toLowerCase().includes(search);
    });

    if (!open) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.fullScreenContainer}>
                <div className={styles.sideNav}>
                    <div className={styles.navHeader}>
                        <h3 style={{ fontSize: 18, color: 'white', margin: 0 }}>Admin Panel</h3>
                    </div>

                    <nav className={styles.navItems}>
                        <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /><span>Tổng quan</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'sell_requests' ? styles.active : ''}`} onClick={() => setActiveTab('sell_requests')}><PlusCircle size={18} /><span>Duyệt bán</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'buy_requests' ? styles.active : ''}`} onClick={() => setActiveTab('buy_requests')}><Ticket size={18} /><span>Duyệt mua</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /><span>Người dùng</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}><Package size={18} /><span>Danh mục</span></button>
                    </nav>

                    <div className={styles.navFooter}>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={18} /> <span>Đóng</span>
                        </button>
                    </div>
                </div>

                <div className={styles.mainArea}>
                    <div className={styles.header}>
                        <h2>
                            {activeTab === 'dashboard' && 'Tổng quan hệ thống'}
                            {activeTab === 'sell_requests' && 'Yêu cầu đăng bán (Chờ duyệt)'}
                            {activeTab === 'buy_requests' && 'Yêu cầu mua hàng (Tickets)'}
                            {activeTab === 'users' && 'Quản lý người dùng'}
                            {activeTab === 'categories' && 'Quản lý danh mục game'}
                        </h2>
                    </div>

                    <div className={styles.content}>
                        {activeTab === 'dashboard' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                                <StatsCard label="Tổng Ticket" value={tickets.length} icon={<Ticket />} color="#3b82f6" />
                                <StatsCard label="Tổng Account" value={accounts.length} icon={<Package />} color="#8b5cf6" />
                            </div>
                        )}

                        {activeTab === 'sell_requests' && (
                            <div className={styles.list}>
                                {accounts.filter(a => a.status === 'pending').map(acc => (
                                    <div key={acc.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <img src={acc.thumbnail} alt="" className={styles.itemThumb} />
                                            <div>
                                                <p className={styles.itemTitle}>{acc.title}</p>
                                                <p className={styles.itemSub}>{acc.game} • {acc.server}</p>
                                                <p className={styles.itemPrice}>{acc.price.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button 
                                                disabled={processingId === acc.id}
                                                onClick={async () => {
                                                    setProcessingId(acc.id);
                                                    try {
                                                        await approveAccount(acc.id);
                                                        showToast('Đã duyệt tài khoản!');
                                                        queryClient.invalidateQueries({ queryKey: ['accounts'] });
                                                    } catch (err) {
                                                        showToast('Lỗi khi duyệt tài khoản', 'error');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }} 
                                                className={styles.actionBtn}
                                            >
                                                {processingId === acc.id ? '...' : 'Duyệt'}
                                            </button>
                                            <button 
                                                disabled={processingId === acc.id}
                                                onClick={async () => {
                                                    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
                                                    setProcessingId(acc.id);
                                                    try {
                                                        await deleteAccount(acc.id);
                                                        showToast('Đã xóa bài đăng!');
                                                        queryClient.invalidateQueries({ queryKey: ['accounts'] });
                                                    } catch (err) {
                                                        showToast('Lỗi khi xóa bài đăng', 'error');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }} 
                                                className={styles.deleteBtn}
                                            >
                                                {processingId === acc.id ? '...' : 'Xóa'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {accounts.filter(a => a.status === 'pending').length === 0 && (
                                    <div className={styles.emptyState}>Không có yêu cầu đăng bán nào đang chờ.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'buy_requests' && (
                            <div className={styles.list}>
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.ticketBadge}>#{ticket.id.slice(0, 8).toUpperCase()}</div>
                                            <div>
                                                <p className={styles.itemTitle}>Người mua: {ticket.buyer_phone || ticket.buyer_contact}</p>
                                                <p className={styles.itemSub}>
                                                    ID Acc: {ticket.account_id.slice(0, 8)}... • 
                                                    Giá: {ticket.price.toLocaleString()}đ
                                                </p>
                                                <div className={styles.statusPill} style={{ 
                                                    background: `${TICKET_STATUS_COLORS[ticket.status]}20`, 
                                                    color: TICKET_STATUS_COLORS[ticket.status],
                                                    border: `1px solid ${TICKET_STATUS_COLORS[ticket.status]}40`
                                                }}>
                                                    {TICKET_STATUS_LABELS[ticket.status]}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            {ticket.status === 'pending_match' && (
                                                <button 
                                                    className={styles.actionBtn}
                                                    onClick={async () => {
                                                        try {
                                                            await updateTicketStatus(ticket.id, 'matched');
                                                            showToast('Đã xác nhận khớp lệnh!');
                                                            loadTickets();
                                                        } catch {
                                                            showToast('Lỗi khi cập nhận trạng thái', 'error');
                                                        }
                                                    }}
                                                >
                                                    Ghép đôi
                                                </button>
                                            )}
                                            <button 
                                                className={styles.deleteBtn}
                                                onClick={async () => {
                                                    if (!confirm('Hủy yêu cầu mua này?')) return;
                                                    try {
                                                        await updateTicketStatus(ticket.id, 'cancelled');
                                                        showToast('Đã hủy ticket');
                                                        loadTickets();
                                                    } catch {
                                                        showToast('Lỗi khi hủy', 'error');
                                                    }
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tickets.length === 0 && (
                                    <div className={styles.emptyState}>Chưa có yêu cầu mua hàng nào.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className={styles.tabContent}>
                                {CATEGORY_STRUCTURE.map(group => (
                                    <div key={group.id} className={styles.categoryGroup}>
                                        <h4 className={styles.groupTitle}>{group.label}</h4>
                                        <div className={styles.categoryGrid}>
                                            {group.items.map(key => (
                                                <div key={key} className={styles.categoryItem}>
                                                    <span>{CATEGORY_LABELS[key]}</span>
                                                    <code style={{ fontSize: 10, opacity: 0.5 }}>{key}</code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className={styles.tabContent}>
                                <div style={{ marginBottom: 20 }}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm theo Email hoặc ID..."
                                        className={styles.searchInput}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 16px', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 12,
                                            color: 'white',
                                            fontSize: 14
                                        }}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                                <div className={styles.list}>
                                    {filteredProfiles.map(p => {
                                        return (
                                            <div key={p.id} className={styles.item}>
                                                <div className={styles.itemInfo}>
                                                    <div className={styles.iconWrapper}><User size={18} /></div>
                                                    <div>
                                                        <p className={styles.itemTitle} style={{ fontSize: 16, fontWeight: 700 }}>
                                                            {p.email || `User ID: ${p.id.slice(0, 8)}...`}
                                                        </p>
                                                        <p className={styles.itemSub}>{p.email ? 'Tài khoản hệ thống' : 'Chưa cập nhật thông tin email'}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10 }}>
                                                        <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Lượt:</span>
                                                        <strong style={{ color: 'var(--color-primary)' }}>{p.spin_turns}</strong>
                                                    </div>
                                                    <button className={styles.actionBtn} onClick={() => handleUpdateSpinTurns(p.id, p.spin_turns + 1)}>+1 Lượt</button>
                                                    <button className={styles.actionBtn} style={{ color: '#ef4444' }} onClick={() => handleUpdateSpinTurns(p.id, Math.max(0, p.spin_turns - 1))}>-1</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredProfiles.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-dim)' }}>
                                            Không tìm thấy người dùng nào.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatsCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 15 }}>
            <div style={{ color: color }}>{icon}</div>
            <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
            </div>
        </div>
    );
}
