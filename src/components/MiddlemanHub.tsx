// src/components/MiddlemanHub.tsx
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
    User, 
    LayoutDashboard, Package, X, PlusCircle, Users, Trash2, 
    RefreshCw, CheckCircle, Ban, Edit, Image as ImageIcon, ShieldCheck
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_STRUCTURE } from '../types/account';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '../types/ticket';
import type { TradeAccount } from '../types/account';
import type { TransactionTicket } from '../types/ticket';
import { approveAccount, rejectAccount } from '../api/accounts';
import { getTickets, updateTicketStatus } from '../api/tickets';
import { getProfiles, updateSpinTurns, UserProfile, getMidmanApplications, approveMidmanApplication, rejectMidmanApplication, MidmanApplication } from '../api/profiles';
import { getCategories, upsertCategory, deleteCategory, Category } from '../api/categories';
import { uploadImages } from '../api/storage';
import styles from './MiddlemanHub.module.css';

interface MiddlemanHubProps {
    open: boolean;
    onClose: () => void;
    accounts: TradeAccount[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    onOpenTradeRoom?: (ticket: TransactionTicket) => void;
}

type Tab = 'dashboard' | 'sell_requests' | 'trading' | 'completed' | 'cancelled' | 'users' | 'categories' | 'midman_apps';

export default function MiddlemanHub({ open, onClose, accounts, showToast, onOpenTradeRoom }: MiddlemanHubProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [tickets, setTickets] = useState<TransactionTicket[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [midmanApps, setMidmanApps] = useState<MidmanApplication[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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

    const loadApps = useCallback(async () => {
        try {
            const data = await getMidmanApplications();
            setMidmanApps(data);
        } catch (error: any) {
            console.error('Error loading apps:', error);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            if (data.length > 0) {
                setCategories(data);
            } else {
                // Use default structure if DB is empty/fails
                const fallback: Category[] = [];
                CATEGORY_STRUCTURE.forEach(group => {
                    group.items.forEach(key => {
                        fallback.push({
                            id: key,
                            name: CATEGORY_LABELS[key],
                            group_id: group.id,
                            group_label: group.label
                        });
                    });
                });
                setCategories(fallback);
            }
        } catch (error: any) {
            console.error('Error loading categories:', error);
        }
    }, []);

    useEffect(() => {
        if (open) {
            loadTickets();
            loadProfiles();
            loadApps();
            loadCategories();
        }
    }, [open, loadTickets, loadProfiles, loadApps, loadCategories]);

    const handleUpsertCategory = async (cat: Category) => {
        setProcessingId(cat.id);
        try {
            await upsertCategory(cat);
            showToast('Đã lưu danh mục!');
            loadCategories();
            setEditingCategory(null);
        } catch {
            showToast('Lỗi khi lưu danh mục', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Xóa danh mục này? Các tài khoản thuộc danh mục này có thể bị mất phân loại.')) return;
        setProcessingId(id);
        try {
            await deleteCategory(id);
            showToast('Đã xóa danh mục!');
            loadCategories();
        } catch {
            showToast('Lỗi khi xóa', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, cat: Partial<Category>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const urls = await uploadImages([file]);
            if (urls[0]) {
                setEditingCategory({ ...cat, icon_url: urls[0] });
                showToast('Đã tải ảnh lên!');
            }
        } catch {
            showToast('Lỗi tải ảnh', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const groupedCategories = categories.reduce((acc, cat) => {
        if (!acc[cat.group_id]) {
            acc[cat.group_id] = { label: cat.group_label, items: [] };
        }
        acc[cat.group_id].items.push(cat);
        return acc;
    }, {} as Record<string, { label: string, items: Category[] }>);

    const getGameName = (id: string) => {
        return categories.find(c => c.id === id)?.name || id;
    };

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
                        <button className={`${styles.navItem} ${activeTab === 'trading' ? styles.active : ''}`} onClick={() => setActiveTab('trading')}><RefreshCw size={18} /><span>Giao dịch</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'midman_apps' ? styles.active : ''}`} onClick={() => setActiveTab('midman_apps')}><ShieldCheck size={18} /><span>Duyệt Midman</span></button>
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
                            {activeTab === 'trading' && 'Đang trong quá trình giao dịch'}
                            {activeTab === 'midman_apps' && 'Đơn ứng tuyển Midman'}
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
                                <StatsCard label="Đang giao dịch" value={tickets.filter(t => ['matched', 'trading'].includes(t.status)).length} icon={<RefreshCw />} color="#a855f7" />
                                <StatsCard label="Đã hoàn thành" value={tickets.filter(t => t.status === 'completed').length} icon={<CheckCircle />} color="#10b981" />
                                <StatsCard label="Đã hủy/Từ chối" value={accounts.filter(a => a.status === 'rejected').length + tickets.filter(t => t.status === 'cancelled').length} icon={<Ban />} color="#ef4444" />
                                <StatsCard label="Midman Apps" value={midmanApps.filter(a => a.status === 'pending').length} icon={<ShieldCheck />} color="#10b981" />
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
                                                <p className={styles.itemSub}>{getGameName(acc.game)} • {acc.server}</p>
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

                        {activeTab === 'midman_apps' && (
                            <div className={styles.list}>
                                {midmanApps.filter(a => a.status === 'pending').map(app => (
                                    <div key={app.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.iconWrapper}><ShieldCheck size={18} /></div>
                                            <div>
                                                <p className={styles.itemTitle}>
                                                    {app.full_name || 'Ứng viên mới'} 
                                                    <span style={{ fontSize: 13, color: 'var(--color-text-dim)', marginLeft: 8, fontWeight: 'normal' }}>
                                                        ({app.profiles?.email || app.user_id.slice(0, 8)})
                                                    </span>
                                                </p>
                                                <p className={styles.itemSub} style={{ lineHeight: 1.6 }}>
                                                    CCCD: <strong style={{color:'white'}}>{app.cccd}</strong> 
                                                    {app.cccd_front_url && <span> [<a href={app.cccd_front_url} target="_blank" rel="noreferrer" style={{color: '#34d399'}}>Mặt Trước</a>]</span>}
                                                    {app.cccd_back_url && <span> [<a href={app.cccd_back_url} target="_blank" rel="noreferrer" style={{color: '#34d399'}}>Mặt Sau</a>]</span>}
                                                    <br/>
                                                    Phí đề xuất: <strong style={{color:'var(--color-accent)'}}>{app.fee_rate || 'N/A'}</strong> • 
                                                    Giờ HĐ: <strong style={{color:'white'}}>{app.working_hours || 'N/A'}</strong> <br/>
                                                    FB: <a href={app.facebook_url} target="_blank" rel="noreferrer" style={{color: 'var(--color-primary)'}}>{app.facebook_url}</a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button 
                                                disabled={processingId === app.id}
                                                onClick={async () => {
                                                    setProcessingId(app.id);
                                                    try {
                                                        await approveMidmanApplication(app.id, app.user_id);
                                                        showToast('Đã cấp quyền Midman thành công!');
                                                        loadApps();
                                                        loadProfiles();
                                                    } catch (err) {
                                                        showToast('Lỗi khi duyệt', 'error');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }} 
                                                className={styles.actionBtn}
                                            >
                                                {processingId === app.id ? '...' : 'Duyệt'}
                                            </button>
                                            <button 
                                                disabled={processingId === app.id}
                                                onClick={async () => {
                                                    if (!confirm('Từ chối đơn ứng tuyển này?')) return;
                                                    setProcessingId(app.id);
                                                    try {
                                                        await rejectMidmanApplication(app.id);
                                                        showToast('Đã từ chối!');
                                                        loadApps();
                                                    } catch (err) {
                                                        showToast('Lỗi khi từ chối', 'error');
                                                    } finally {
                                                        setProcessingId(null);
                                                    }
                                                }} 
                                                className={styles.deleteBtn}
                                            >
                                                {processingId === app.id ? '...' : 'Từ chối'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {midmanApps.filter(a => a.status === 'pending').length === 0 && (
                                    <div className={styles.emptyState}>Không có yêu cầu duyệt Midman nào mới.</div>
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
                                                onClick={() => onOpenTradeRoom?.(ticket)}
                                            >
                                                Vào Phòng Chat
                                            </button>

                                            <button 
                                                className={styles.actionBtn} 
                                                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-dim)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                                onClick={() => {
                                                    if (ticket.room_url) window.open(ticket.room_url, '_blank')
                                                }}
                                            >
                                                Jitsi
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
                                                <p className={styles.itemSub}>{getGameName(acc.game)} • {acc.price.toLocaleString()}đ</p>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <p style={{ color: 'var(--color-text-dim)', fontSize: 14 }}>
                                        Quản lý danh mục game và các dịch vụ khác trên sàn.
                                    </p>
                                    <button 
                                        className="btn-premium" 
                                        style={{ padding: '8px 20px', fontSize: 13 }}
                                        onClick={() => setEditingCategory({ group_id: 'game', group_label: 'Game' })}
                                    >
                                        + Thêm danh mục mới
                                    </button>
                                </div>

                                {Object.entries(groupedCategories).map(([groupId, group]) => (
                                    <div key={groupId} className={styles.categoryGroup}>
                                        <h4 className={styles.groupTitle}>{group.label}</h4>
                                        <div className={styles.categoryGrid}>
                                            {group.items.map(cat => (
                                                <div key={cat.id} className={styles.categoryItem} style={{ position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        {cat.icon_url ? (
                                                            <img src={cat.icon_url} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                                                <ImageIcon size={16} opacity={0.3} />
                                                            </div>
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{cat.name}</p>
                                                            <code style={{ fontSize: 10, opacity: 0.5 }}>{cat.id}</code>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <button 
                                                                className={styles.iconBtn} 
                                                                style={{ background: 'transparent', border: 'none' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingCategory(cat);
                                                                }}
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button 
                                                                className={styles.iconBtn} 
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCategory(cat.id);
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {editingCategory && (
                                    <div className={styles.overlay} style={{ zIndex: 3000 }} onClick={() => setEditingCategory(null)}>
                                        <div className={styles.modalContent} style={{ maxWidth: 500, margin: '100px auto', padding: 30, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 20 }} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                                <h3 style={{ margin: 0 }}>{editingCategory.id ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                                                <button onClick={() => setEditingCategory(null)} style={{ background: 'none', border: 'none', color: 'white' }}><X size={20} /></button>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>Mã ID (Không dấu, không khoảng cách)</label>
                                                    <input 
                                                        type="text" 
                                                        className={styles.searchInput} 
                                                        disabled={!!editingCategory.id}
                                                        value={editingCategory.id || ''}
                                                        onChange={e => setEditingCategory({...editingCategory, id: e.target.value})}
                                                        placeholder="Vd: genshin_impact"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>Tên hiển thị</label>
                                                    <input 
                                                        type="text" 
                                                        className={styles.searchInput}
                                                        value={editingCategory.name || ''}
                                                        onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                                                        placeholder="Vd: Genshin Impact"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>Nhóm danh mục</label>
                                                    <select 
                                                        className={styles.searchInput}
                                                        value={editingCategory.group_id}
                                                        onChange={e => {
                                                            const opt = e.target.options[e.target.selectedIndex];
                                                            setEditingCategory({...editingCategory, group_id: e.target.value, group_label: opt.text});
                                                        }}
                                                    >
                                                        <option value="game">Game</option>
                                                        <option value="social">Mạng xã hội</option>
                                                        <option value="entertainment">Giải trí & Học tập</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 8 }}>Ảnh Icon</label>
                                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                        {editingCategory.icon_url && <img src={editingCategory.icon_url} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />}
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            style={{ display: 'none' }} 
                                                            id="cat-icon-upload"
                                                            onChange={(e) => handleIconUpload(e, editingCategory)}
                                                        />
                                                        <label htmlFor="cat-icon-upload" className={styles.actionBtn} style={{ flex: 1, cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}>
                                                            <ImageIcon size={16} /> {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                                                    <button 
                                                        className="btn-premium" 
                                                        style={{ flex: 1, padding: 14 }}
                                                        disabled={!editingCategory.id || !editingCategory.name || isUploading}
                                                        onClick={() => handleUpsertCategory(editingCategory as Category)}
                                                    >
                                                        {processingId === editingCategory.id ? 'Đang lưu...' : 'Lưu dữ liệu'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
