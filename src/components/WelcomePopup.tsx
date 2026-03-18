import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, TrendingUp, Shield } from 'lucide-react';
import Logo from './Logo';
import styles from './WelcomePopup.module.css';

interface WelcomePopupProps {
    onOpenSellModal: () => void;
    onOpenApplyMidman: () => void;
}

const STORAGE_KEY = 'gt_visited';

export default function WelcomePopup({ onOpenSellModal, onOpenApplyMidman }: WelcomePopupProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Slight delay so page can render first, then show popup
        const timer = setTimeout(() => {
            const visited = localStorage.getItem(STORAGE_KEY);
            if (!visited) {
                setVisible(true);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleBuy = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
        // Scroll to product list after modal closes
        setTimeout(() => {
            const el = document.getElementById('product-list');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
    };

    const handleSell = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
        // Open sell modal after animation completes
        setTimeout(() => {
            onOpenSellModal();
        }, 350);
    };

    const handleApplyMidman = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
        setTimeout(() => {
            onOpenApplyMidman();
        }, 350);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    >
                        {/* Badge */}
                        <div className={styles.headerBadge}>
                            <Logo size={14} className={styles.gemIcon} style={{ color: 'var(--color-primary)' }} />
                            <span>EasyTrade — Sàn giao dịch uy tín #1</span>
                        </div>

                        {/* Title */}
                        <h2 className={`${styles.title} text-gradient`}>
                            Chào mừng đến với EasyTrade!
                        </h2>

                        {/* Tâm thư */}
                        <div className={styles.letter}>
                            <p>
                                Kính gửi anh/chị, khách hàng của EasyTrade.<br /><br />
                                EasyTrade được xây dựng để trở thành <strong>cầu nối an toàn</strong> giữa
                                người mua và người bán các loại tài khoản điện tử. Chúng tôi cam kết mọi giao dịch đều
                                được bảo đảm bởi hệ thống chuyên nghiệp — <strong>không lo lừa đảo tiền,
                                    không lo mất tài khoản</strong>.
                            </p>
                        </div>

                        {/* Divider element */}
                        <div className={styles.question}>
                            <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--color-primary)' }} />
                            Bạn đến đây với mục đích gì?
                        </div>

                        {/* CTA Buttons */}
                        <div className={styles.ctaGroup}>
                            <motion.button
                                className={styles.btnBuy}
                                onClick={handleBuy}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className={styles.btnIcon}>
                                    <Handshake size={20} />
                                </div>
                                <span className={styles.btnLabel}>Tôi tìm mua acc</span>
                                <span className={styles.btnSub}>Tìm kiếm & mua tài khoản phù hợp</span>
                            </motion.button>

                            <motion.button
                                className={styles.btnSell}
                                onClick={handleSell}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className={styles.btnIcon}>
                                    <TrendingUp size={22} />
                                </div>
                                <span className={styles.btnLabel}>Tôi đăng bán acc</span>
                                <span className={styles.btnSub}>Ký gửi qua hệ thống trung gian</span>
                            </motion.button>

                            <motion.button
                                className={styles.btnMidman}
                                onClick={handleApplyMidman}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className={styles.btnIcon}>
                                    <Shield size={20} />
                                </div>
                                <span className={styles.btnLabel}>Ứng tuyển làm Midman</span>
                                <span className={styles.btnSub}>Trở thành đối tác giao dịch trung gian chuyên nghiệp</span>
                            </motion.button>
                        </div>

                        <p className={styles.footerNote}>
                            Thông tin này chỉ hiển thị một lần • Có thể quay lại bất cứ lúc nào
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
