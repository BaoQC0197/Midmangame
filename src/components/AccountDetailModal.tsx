import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Handshake, ShieldCheck, Gamepad2, Server, LayoutGrid } from 'lucide-react';
import type { TradeAccount } from '../types/account';
import { CATEGORY_LABELS } from '../types/account';
import styles from './AccountDetailModal.module.css';

interface AccountDetailModalProps {
    account: TradeAccount | null;
    onClose: () => void;
    onBuy: (account: TradeAccount) => void;
}

export default function AccountDetailModal({ account, onClose, onBuy }: AccountDetailModalProps) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!account) return null;

    const images = account.images && account.images.length > 0 ? account.images : [account.thumbnail];
    
    // Logic tính phí tương tự như modal Sell/Buy
    const rawFee = Math.max(account.price * 0.05, 30000);
    const buyerFee = account.fee_payer === 'buyer' ? rawFee : account.fee_payer === 'split' ? rawFee / 2 : 0;
    const finalBuyerPrice = account.price + buyerFee;

    const formattedPrice = (val: number) => new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND'
    }).format(val);

    const handleNext = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
    const handlePrev = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <AnimatePresence>
            <motion.div 
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div 
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>

                    {/* GALLERY */}
                    <div className={styles.gallerySection}>
                        <div className={styles.mainImageContainer}>
                            <motion.img 
                                key={activeImageIndex}
                                src={images[activeImageIndex]} 
                                alt={`${account.title} - ${activeImageIndex + 1}`}
                                className={styles.mainImage}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            />
                            
                            {images.length > 1 && (
                                <>
                                    <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={handlePrev}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.navNext}`} onClick={handleNext}>
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {images.map((img, idx) => (
                                    <img 
                                        key={idx}
                                        src={img}
                                        className={`${styles.thumb} ${idx === activeImageIndex ? styles.thumbActive : ''}`}
                                        onClick={() => setActiveImageIndex(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFO */}
                    <div className={styles.infoSection}>
                        <div className={styles.header}>
                            <div className={styles.badges}>
                                <div className={styles.gameBadge}>
                                    <Gamepad2 size={14} />
                                    <span>{CATEGORY_LABELS[account.game]}</span>
                                </div>
                                <div className={styles.badge}>
                                    <Server size={12} />
                                    <span>{account.server}</span>
                                </div>
                                <div className={styles.badge}>
                                    <LayoutGrid size={12} />
                                    <span>{account.account_type || 'VIP'}</span>
                                </div>
                            </div>
                            <h2>{account.title}</h2>
                        </div>

                        <div className={styles.priceBox}>
                            <span className={styles.priceLabel}>Giá niêm yết của người bán</span>
                            <div className={styles.priceValue}>{formattedPrice(account.price)}</div>
                        </div>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Server</span>
                                <div className={styles.detailValue}>{account.server}</div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Mã định danh</span>
                                <div className={styles.detailValue}>#{account.id.slice(0, 8).toUpperCase()}</div>
                            </div>
                        </div>

                        <div className={styles.description}>
                            <h4>Mô tả tài khoản</h4>
                            <p>{account.description}</p>
                        </div>

                        {/* PHÍ TRUNG GIAN MINH BẠCH */}
                        <div className={styles.feeTransparency}>
                            <div className={styles.feeTable}>
                                <div className={styles.feeRow}>
                                    <span>Phí giao dịch trung gian (5%)</span>
                                    <span>{formattedPrice(rawFee)}</span>
                                </div>
                                <div className={styles.feeRow}>
                                    <span>Bên chịu phí</span>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                        {account.fee_payer === 'seller' ? 'Người bán chịu' : 
                                         account.fee_payer === 'buyer' ? 'Người mua chịu' : 'Chia đôi 50/50'}
                                    </span>
                                </div>
                                <div className={`${styles.feeRow} ${styles.total}`}>
                                    <span>Tổng cộng cần thanh toán</span>
                                    <span style={{ color: 'var(--color-accent)', fontSize: '18px' }}>
                                        {formattedPrice(finalBuyerPrice)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ marginTop: 12, display: 'flex', gap: 8, fontSize: '12px', color: 'var(--color-text-dim)' }}>
                                <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                                <span>Giao dịch của bạn được bảo hiểm 100% khi sử dụng dịch vụ trung gian của EasyTrade.</span>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button 
                                className="btn-premium"
                                style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                                onClick={() => onBuy(account)}
                                disabled={account.is_sold || account.has_active_ticket}
                            >
                                <Handshake size={20} />
                                {account.is_sold ? 'ĐÃ BÁN' : account.has_active_ticket ? 'ĐANG CÓ NGƯỜI ĐẶT' : 'GỬI YÊU CẦU MUA NGAY'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
