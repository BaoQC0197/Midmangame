import { motion } from 'framer-motion';
import { Handshake, ShieldCheck, Gamepad2, TrendingUp, Server } from 'lucide-react';
import type { TradeAccount } from '../types/account';
import { CATEGORY_LABELS } from '../types/account';
import styles from './MarketAccountCard.module.css';

interface MarketAccountCardProps {
    account: TradeAccount;
    onClick: (account: TradeAccount) => void;
    onBuyRequest: (account: TradeAccount) => void;
}

export default function MarketAccountCard({ account, onClick, onBuyRequest }: MarketAccountCardProps) {
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(account.price);

    return (
        <motion.div
            className={`${styles.card} glass-card ${account.is_sold ? styles.sold : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={account.is_sold ? {} : { y: -10 }}
            onClick={() => onClick(account)}
        >
            <div className={styles.imageContainer}>
                <img src={account.thumbnail} alt={account.title} className={styles.image} />
                <div className={styles.imageOverlay} />
                <div className={styles.gameBadge}>
                    <Gamepad2 size={12} />
                    <span>{CATEGORY_LABELS[account.game]}</span>
                </div>
                {account.promotion && !account.is_sold && !account.has_active_ticket && (
                    <div className={styles.promoBadge}>
                        <TrendingUp size={12} />
                        <span>HOT Account</span>
                    </div>
                )}

                {/* Status Badges */}
                {account.is_sold ? (
                    <div className={`${styles.statusBadge} ${styles.statusSold}`}>
                        <ShieldCheck size={12} />
                        <span>ĐÃ BÁN</span>
                    </div>
                ) : account.has_active_ticket ? (
                    <div className={`${styles.statusBadge} ${styles.statusLocked}`}>
                        <Handshake size={12} />
                        <span>ĐANG CÓ NGƯỜI ĐẶT</span>
                    </div>
                ) : null}
            </div>

            <div className={styles.content}>
                <div className={styles.categoryRow}>
                    <span className={styles.category}>{account.account_type || 'Tài khoản VIP'}</span>
                    <div className={styles.serverBadge}>
                        <Server size={12} />
                        <span>{account.server}</span>
                    </div>
                </div>

                <h3 className={styles.title}>{account.title}</h3>

                <div className={styles.divider} />

                <div className={styles.footer}>
                    <div className={styles.priceSection}>
                        <span className={styles.priceLabel}>Giá account</span>
                        <div className={styles.priceValue}>{formattedPrice}</div>
                    </div>

                    <button
                        className={`${styles.actionBtn} ${(account.is_sold || account.has_active_ticket) ? styles.disabled : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!account.is_sold && !account.has_active_ticket) onBuyRequest(account);
                        }}
                        disabled={account.is_sold || account.has_active_ticket}
                        title={account.is_sold ? "Đã bán" : account.has_active_ticket ? "Đang có người đặt" : "Đặt yêu cầu mua"}
                    >
                        <Handshake size={20} />
                    </button>
                </div>

            </div>
        </motion.div>
    );
}
