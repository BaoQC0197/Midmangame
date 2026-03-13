// src/components/MiddlemanHub.tsx
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
    User, 
    LayoutDashboard, Package, X, PlusCircle, Users, Trash2, 
    Clock, RefreshCw, CheckCircle, Ban
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_STRUCTURE } from '../types/account';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '../types/ticket';
import type { TradeAccount } from '../types/account';
import type { TransactionTicket } from '../types/ticket';
import { approveAccount, rejectAccount } from '../api/accounts';
import { getTickets, updateTicketStatus } from '../api/tickets';
import { getProfiles, updateSpinTurns, UserProfile } from '../api/profiles';
import styles from './MiddlemanHub.module.css';

interface MiddlemanHubProps {
    open: boolean;
    onClose: () => void;
    accounts: TradeAccount[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type Tab = 'dashboard' | 'sell_requests' | 'buy_requests' | 'trading' | 'completed' | 'cancelled' | 'users' | 'categories';

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
                        <button className={`${styles.navItem} ${activeTab === 'buy_requests' ? styles.active : ''}`} onClick={() => setActiveTab('buy_requests')}><Clock size={18} /><span>Duyệt mua</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'trading' ? styles.active : ''}`} onClick={() => setActiveTab('trading')}><RefreshCw size={18} /><span>Giao dịch</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'completed' ? styles.active : ''}`} onClick={() => setActiveTab('completed')}><CheckCircle size={18} /><span>Hoàn thành</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'cancelled' ? styles.active : ''}`} onClick={() => setActiveTab('cancelled')}><Ban size={18} /><span>Đã hủy</span></button>
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
                            {activeTab === 'trading' && 'Đang trong quá trình giao dịch'}
                            {activeTab === 'completed' && 'Giao dịch đã hoàn thành'}
                            {activeTab === 'cancelled' && 'Yêu cầu bị từ chối / Đã hủy'}
                            {activeTab === 'users' && 'Quản lý người dùng'}
                            {activeTab === 'categories' && 'Quản lý danh mục game'}
                        </h2>
                    </div>

                    <div className={styles.content}>
                        {activeTab === 'dashboard' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                                <StatsCard label="Chờ duyệt bán" value={accounts.filter(a => a.status === 'pending').length} icon={<PlusCircle />} color="#f59e0b" />
                                <StatsCard label="Chờ duyệt mua" value={tickets.filter(t => t.status === 'pending_match').length} icon={<Clock />} color="#3b82f6" />
                                <StatsCard label="Đang giao dịch" value={tickets.filter(t => ['matched', 'trading'].includes(t.status)).length} icon={<RefreshCw />} color="#a855f7" />
                                <StatsCard label="Đã hoàn thành" value={tickets.filter(t => t.status === 'completed').length} icon={<CheckCircle />} color="#10b981" />
                                <StatsCard label="Đã hủy/Từ chối" value={accounts.filter(a => a.status === 'rejected').length + tickets.filter(t => t.status === 'cancelled').length} icon={<Ban />} color="#ef4444" />
                                <StatsCard label="Người dùng" value={profiles.length} icon={<Users />} color="#6366f1" />
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
                                                    if (!confirm('Từ chối bài đăng này? Nó sẽ được chuyển vào tab Đã Hủy.')) return;
                                                    setProcessingId(acc.id);
                                                    try {
                                                        await rejectAccount(acc.id);
                                                        showToast('Đã từ chối bài đăng!');
                                                        queryClient.invalidateQueries({ queryKey: ['accounts'] });
                                                    } catch (err) {
                                                        showToast('Lỗi khi từ chối bài đăng', 'error');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }} 
                                                className={styles.deleteBtn}
                                            >
                                                {processingId === acc.id ? '...' : 'Từ chối'}
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
                                {tickets.filter(t => t.status === 'pending_match').map(ticket => (
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
                                {tickets.filter(t => t.status === 'pending_match').length === 0 && (
                                    <div className={styles.emptyState}>Không có yêu cầu mua hàng nào đang chờ.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'trading' && (
                            <div className={styles.list}>
                                {tickets.filter(t => ['matched', 'trading'].includes(t.status)).map(ticket => (
                                    <div key={ticket.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.ticketBadge}>#{ticket.id.slice(0, 8).toUpperCase()}</div>
                                            <div>
                                                <p className={styles.itemTitle}>Phòng: {ticket.id.slice(0, 8)}</p>
                                                <p className={styles.itemSub}>
                                                    Mua: {ticket.buyer_phone} • Giá: {ticket.price.toLocaleString()}đ
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
                                            <button 
                                                className={styles.actionBtn} 
                                                onClick={async () => {
                                                    if (!confirm('Xác nhận hoàn thành giao dịch này?')) return;
                                                    try {
                                                        await updateTicketStatus(ticket.id, 'completed');
                                                        showToast('Đã chốt hoàn thành!');
                                                        loadTickets();
                                                    } catch {
                                                        showToast('Lỗi khi cập nhật', 'error');
                                                    }
                                                }}
                                            >
                                                Xong
                                            </button>
                                            <button 
                                                className={styles.actionBtn} 
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                                                onClick={() => ticket.room_url && window.open(ticket.room_url, '_blank')}
                                            >
                                                Vào Room
                                            </button>
                                            <button 
                                                className={styles.deleteBtn}
                                                onClick={async () => {
                                                    if (!confirm('Hủy giao dịch này?')) return;
                                                    try {
                                                        await updateTicketStatus(ticket.id, 'cancelled');
                                                        loadTickets();
                                                    } catch {
                                                        showToast('Lỗi khi hủy', 'error');
                                                    }
                                                }}
                                            >
                                                <Ban size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tickets.filter(t => ['matched', 'trading'].includes(t.status)).length === 0 && (
                                    <div className={styles.emptyState}>Không có giao dịch nào đang diễn ra.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'completed' && (
                            <div className={styles.list}>
                                {tickets.filter(t => t.status === 'completed').map(ticket => (
                                    <div key={ticket.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.ticketBadge}>#{ticket.id.slice(0, 8).toUpperCase()}</div>
                                            <div>
                                                <p className={styles.itemTitle}>Hoàn thành: {ticket.id.slice(0, 8)}</p>
                                                <p className={styles.itemSub}>Giá: {ticket.price.toLocaleString()}đ</p>
                                                <div className={styles.statusPill} style={{ background: '#10b98120', color: '#10b981' }}>
                                                    {TICKET_STATUS_LABELS[ticket.status]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tickets.filter(t => t.status === 'completed').length === 0 && (
                                    <div className={styles.emptyState}>Chưa có giao dịch nào hoàn thành.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'cancelled' && (
                            <div className={styles.list}>
                                {/* Sell rejections */}
                                {accounts.filter(a => a.status === 'rejected').map(acc => (
                                    <div key={acc.id} className={styles.item} style={{ opacity: 0.7 }}>
                                        <div className={styles.itemInfo}>
                                            <img src={acc.thumbnail} alt="" className={styles.itemThumb} />
                                            <div>
                                                <p className={styles.itemTitle}>{acc.title} (Bị từ chối bán)</p>
                                                <p className={styles.itemSub}>{acc.game} • {acc.price.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Buy cancellations */}
                                {tickets.filter(t => t.status === 'cancelled').map(ticket => (
                                    <div key={ticket.id} className={styles.item} style={{ opacity: 0.7 }}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.ticketBadge} style={{ background: '#ef444420', color: '#ef4444' }}>#{ticket.id.slice(0, 8).toUpperCase()}</div>
                                            <div>
                                                <p className={styles.itemTitle}>Ticket bị hủy: {ticket.id.slice(0, 8)}</p>
                                                <p className={styles.itemSub}>Mua: {ticket.buyer_phone} • Giá: {ticket.price.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {accounts.filter(a => a.status === 'rejected').length === 0 && tickets.filter(t => t.status === 'cancelled').length === 0 && (
                                    <div className={styles.emptyState}>Trống.</div>
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
