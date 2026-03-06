// src/components/OrderHistoryDrawer.tsx
import { useState } from 'react';
import { getOrdersByPhone } from '../api/orders';
import type { Order } from '../types/order';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types/order';
import styles from './OrderHistoryDrawer.module.css';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function OrderHistoryDrawer({ open, onClose }: Props) {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleSearch = async () => {
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned || cleaned.length < 9) return;
        setLoading(true);
        setSearched(false);
        const data = await getOrdersByPhone(cleaned);
        setOrders(data);
        setSearched(true);
        setLoading(false);
        setExpandedId(null);
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

    const formatPrice = (p: number) => p.toLocaleString('vi-VN') + ' đ';

    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.headerIcon}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </span>
                        <h2 className={styles.headerTitle}>Đơn hàng của tôi</h2>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>
                </div>

                <div className={styles.searchSection}>
                    <p className={styles.searchHint}>Nhập số điện thoại đặt hàng để tra cứu</p>
                    <div className={styles.searchRow}>
                        <input
                            type="tel"
                            className={styles.searchInput}
                            placeholder="Ví dụ: 0981 063 381"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            className={styles.searchBtn}
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? '⏳' : '🔍'}
                        </button>
                    </div>
                </div>

                <div className={styles.body}>
                    {!searched && !loading && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrapper}>
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIconSvg}>
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <path d="M11 8v6M8 11h6" strokeDasharray="2 2" />
                                </svg>
                            </div>
                            <p>Nhập số điện thoại để tra cứu đơn hàng</p>
                        </div>
                    )}

                    {searched && orders.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIconWrapper}>
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIconSvg}>
                                    <path d="M21 8v13H3V8" />
                                    <path d="M1 3h22v5H1z" />
                                    <path d="M10 12h4" />
                                    <line x1="8" y1="6" x2="16" y2="14" stroke="var(--color-danger)" strokeWidth="2" opacity="0.4" />
                                    <line x1="16" y1="6" x2="8" y2="14" stroke="var(--color-danger)" strokeWidth="2" opacity="0.4" />
                                </svg>
                            </div>
                            <p>Chưa xếp đơn nào với số điện thoại này</p>
                        </div>
                    )}

                    {orders.map(order => (
                        <div key={order.id} className={styles.orderCard}>
                            <div
                                className={styles.orderHeader}
                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            >
                                <div className={styles.orderMeta}>
                                    <span className={styles.orderId}>#{order.id}</span>
                                    <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                                </div>
                                <div className={styles.orderRight}>
                                    <span
                                        className={styles.statusBadge}
                                        style={{
                                            background: ORDER_STATUS_COLORS[order.status] + '20',
                                            color: ORDER_STATUS_COLORS[order.status],
                                            borderColor: ORDER_STATUS_COLORS[order.status] + '50',
                                        }}
                                    >
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </span>
                                    <span className={styles.orderTotal}>{formatPrice(order.total_price)}</span>
                                    <span className={styles.expandIcon}>{expandedId === order.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {expandedId === order.id && (
                                <div className={styles.orderDetail}>
                                    <p className={styles.orderAddress}>📍 {order.address}</p>
                                    {order.note && <p className={styles.orderNote}>📝 {order.note}</p>}
                                    <div className={styles.itemList}>
                                        {order.order_items?.map((item, i) => (
                                            <div key={i} className={styles.itemRow}>
                                                <span className={styles.itemName}>{item.product_name} × {item.quantity}</span>
                                                <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.totalRow}>
                                        <span>Tổng cộng</span>
                                        <strong>{formatPrice(order.total_price)}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
}
