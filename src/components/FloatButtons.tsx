// src/components/FloatButtons.tsx
import { useState, useEffect } from 'react';
import styles from './FloatButtons.module.css';

interface FloatButtonsProps {
    onOrderHistory: () => void;
    cartCount: number;
    onCartOpen: () => void;
}

export default function FloatButtons({ onOrderHistory, cartCount, onCartOpen }: FloatButtonsProps) {
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <div className={styles.floatGroup}>
            {/* Giỏ hàng trôi (Mới chuyển từ Header xuống) */}
            <button
                className={`${styles.floatBtn} ${styles.cartFloatBtn}`}
                onClick={onCartOpen}
                title="Giỏ hàng của bạn"
                aria-label="Xem giỏ hàng"
            >
                <div className={styles.cartIconWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="url(#cart-grad)">
                        <defs>
                            <linearGradient id="cart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                        </defs>
                        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className={styles.cartBadgeFloat}>{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                </div>
                <span className={styles.floatLabel}>Giỏ hàng</span>
            </button>
            {/* Order history button (Tra cứu đơn hàng) - ĐƯA LÊN VỊ TRÍ THỨ 2 */}
            <button
                className={`${styles.floatBtn} ${styles.orderHistoryBtn}`}
                onClick={onOrderHistory}
                title="Đơn hàng của tôi"
                aria-label="Xem đơn hàng"
            >
                <div className={styles.iconWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="url(#order-grad)">
                        <defs>
                            <linearGradient id="order-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                        <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                </div>
                <span className={styles.floatLabel}>Đơn của tôi</span>
            </button>

            {/* Zalo button - SỬ DỤNG ẢNH CỦA BRO TRONG PUBLIC */}
            <a href="https://zalo.me/0981063381" target="_blank" rel="noreferrer" className={`${styles.floatBtn} ${styles.zaloBtn}`} title="Chat Zalo">
                <div className={styles.zaloIconWrapper}>
                    <img src="/zaloicon.png" alt="Zalo" className={styles.zaloIconImg} />
                </div>
                <span className={styles.floatLabel}>Chat Zalo</span>
            </a>

            {/* Hotline button */}
            <a href="tel:0981063381" className={`${styles.floatBtn} ${styles.hotlineBtn}`} title="Gọi điện">
                <div className={styles.iconWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="url(#phone-grad)">
                        <defs>
                            <linearGradient id="phone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                        </defs>
                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                    </svg>
                </div>
                <span className={styles.floatLabel}>Gọi ngay</span>
            </a>

            {/* Scroll to top */}
            <button
                className={`${styles.floatBtn} ${styles.topBtn}${showTop ? ' ' + styles.visible : ''}`}
                onClick={scrollToTop}
                title="Lên đầu trang"
                aria-label="Scroll to top"
            >
                ↑
                <span className={styles.floatLabel}>Lên đầu</span>
            </button>
        </div>
    );
}
