import { useState, useEffect, useCallback } from 'react';
import { 
    LayoutDashboard, Clock, RefreshCw, X, Ban, Handshake
} from 'lucide-react';
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from '../types/ticket';
import type { TransactionTicket } from '../types/ticket';
import { getTickets, updateTicketStatus } from '../api/tickets';
import TicketChatRoom from './TicketChatRoom';
import styles from './MiddlemanHub.module.css';

interface MidmanPanelProps {
    open: boolean;
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type Tab = 'dashboard' | 'buy_requests' | 'trading';

export default function MidmanPanel({ open, onClose, showToast }: MidmanPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [tickets, setTickets] = useState<TransactionTicket[]>([]);
    const [selectedChatTicket, setSelectedChatTicket] = useState<TransactionTicket | null>(null);

    const loadTickets = useCallback(async () => {
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (error: any) {
            console.error('Error loading tickets:', error);
            showToast('Không thể tải danh sách ticket', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        if (open) {
            loadTickets();
        }
    }, [open, loadTickets]);

    if (!open) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.fullScreenContainer}>
                <div className={styles.sideNav}>
                    <div className={styles.navHeader}>
                        <h3 style={{ fontSize: 18, color: 'white', margin: 0 }}>Midman Panel</h3>
                    </div>

                    <nav className={styles.navItems}>
                        <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /><span>Tổng quan</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'buy_requests' ? styles.active : ''}`} onClick={() => setActiveTab('buy_requests')}><Clock size={18} /><span>Yêu cầu giao dịch</span></button>
                        <button className={`${styles.navItem} ${activeTab === 'trading' ? styles.active : ''}`} onClick={() => setActiveTab('trading')}><RefreshCw size={18} /><span>Đang giao dịch</span></button>
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
                            {activeTab === 'dashboard' && 'Tổng quan công việc Midman'}
                            {activeTab === 'buy_requests' && 'Yêu cầu giao dịch (Chờ xác nhận)'}
                            {activeTab === 'trading' && 'Đang trong quá trình giao dịch'}
                        </h2>
                    </div>

                    <div className={styles.content}>
                        {activeTab === 'dashboard' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                                <StatsCard label="Chờ xác nhận" value={tickets.filter(t => t.status === 'pending_match').length} icon={<Clock />} color="#3b82f6" />
                                <StatsCard label="Đang giao dịch" value={tickets.filter(t => ['matched', 'trading'].includes(t.status)).length} icon={<RefreshCw />} color="#a855f7" />
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
                                                        showToast('Đã chấp nhận giao dịch!');
                                                        loadTickets();
                                                    } catch {
                                                        showToast('Lỗi khi chấp nhận giao dịch', 'error');
                                                    }
                                                }}
                                            >
                                                <Handshake size={16} style={{ marginRight: 4 }} /> Chấp nhận
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tickets.filter(t => t.status === 'pending_match').length === 0 && (
                                    <div className={styles.emptyState}>Không có yêu cầu giao dịch nào đang chờ.</div>
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
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                                                onClick={() => setSelectedChatTicket(ticket)}
                                            >
                                                Vào Chat 3 Bên
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
                                                <Ban size={16} style={{ marginRight: 4 }} /> Hủy yêu cầu
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {tickets.filter(t => ['matched', 'trading'].includes(t.status)).length === 0 && (
                                    <div className={styles.emptyState}>Không có giao dịch nào đang diễn ra.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedChatTicket && (
                <TicketChatRoom 
                    ticket={selectedChatTicket} 
                    onClose={() => setSelectedChatTicket(null)}
                    onTicketUpdate={loadTickets}
                />
            )}
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
