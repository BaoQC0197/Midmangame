import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp, Sparkles, Star, BadgeCheck, Coffee, Handshake } from 'lucide-react';
import styles from './MarketHero.module.css';
import CoffeeDonateModal from './CoffeeDonateModal';
import { TradeAccount, CATEGORY_LABELS, CategoryKey } from '../types/account';

interface MarketHeroProps {
    onOpenSellModal: () => void;
    onBuyRequest: (account: TradeAccount) => void;
    accounts?: TradeAccount[];
}

interface ShowcaseItem {
    label?: string;
    title?: string;
    price: string | number;
    rank?: string;
    game?: CategoryKey;
    category?: string;
    id?: string;
    thumbnail?: string;
    server?: string;
    account_type?: string;
}

export default function MarketHero({ onOpenSellModal, onBuyRequest, accounts = [] }: MarketHeroProps) {
    const [coffeeModalOpen, setCoffeeModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 3;

    const stats = [
        { icon: <ShieldCheck size={20} />, label: 'An toàn', sub: 'Giao dịch an toàn' },
        { icon: <Zap size={20} />, label: 'Linh hoạt', sub: 'Đội ngũ túc trực 24/7' },
        { icon: <TrendingUp size={20} />, label: 'Tiết kiệm', sub: 'Phí giao dịch thấp' },
    ];

    // Filter hot accounts (limit to 6 for the slider/carousel)
    const hotAccounts = useMemo(() => {
        return accounts.filter(acc => acc.promotion === 'Hot' && !acc.is_sold);
    }, [accounts]);

    // Fallback items if no hot accounts exist
    const fallbackItems: ShowcaseItem[] = [
        { label: 'Genshin Impact', price: '2.500.000đ', rank: 'AR 60', category: 'Game' },
        { label: 'Honkai: Star Rail', price: '1.800.000đ', rank: 'Level 70', category: 'Game' },
        { label: 'Netflix Premium', price: '50.000đ', rank: '1 Month', category: 'Dịch vụ' },
    ];

    const displayItems = hotAccounts.length > 0 ? hotAccounts : fallbackItems;

    // Auto-advance slider
    useEffect(() => {
        if (displayItems.length <= 1) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % displayItems.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [displayItems.length]);

    const currentItem = displayItems[activeIndex];

    return (
        <section className={styles.hero}>
            <div className={styles.heroGlow} />
            <div className={styles.heroCyan} />
            <div className={`container ${styles.heroInner}`}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={styles.content}
                >
                    <motion.div
                        className={styles.badge}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles size={14} className={styles.badgeIcon} />
                        <span>Có Easytrade, Không lo Scam </span>
                    </motion.div>

                    <h1 className={`${styles.title} text-gradient`}>
                        <span className="text-gold">Sàn Trung Gian</span> <br />
                        Tài Khoản & Dịch Vụ
                    </h1>

                    <p className={styles.subtitle}>
                        Nơi trung gian tin cậy cho mọi loại tài khoản số.<br />
                        An toàn, nhanh chóng và bảo mật tuyệt đối.
                    </p>

                    <div className={styles.heroActions}>
                        <motion.button
                            className="btn-premium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenSellModal}
                            style={{ padding: '14px 28px', borderRadius: '14px' }}
                        >
                            <Sparkles size={18} />
                            <span>Đăng ký bán</span>
                            <motion.span
                                animate={{
                                    y: [0, -4, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{ marginLeft: '8px', display: 'inline-block', fontSize: '18px' }}
                            >
                                👆
                            </motion.span>
                        </motion.button>

                        <motion.button
                            className={styles.btnCoffee}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCoffeeModalOpen(true)}
                        >
                            <Coffee size={18} />
                            <span>Mời Admin coffee, cơ hội nhận vòng quay hot account</span>
                        </motion.button>
                    </div>

                    <div className={styles.stats}>
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className={styles.statItem}
                            >
                                <div className={styles.statIcon}>{stat.icon}</div>
                                <div className={styles.statText}>
                                    <strong>{stat.label}</strong>
                                    <span>{stat.sub}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={styles.visual}
                >
                    <div className={styles.visualContainer}>
                        {/* Slider Card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className={`${styles.floatingCard} animate-float`}
                            >
                                <div className={styles.cardTopBar}>
                                    <div className={styles.cardTag}>
                                        <Sparkles size={10} />
                                        <span>Hot Account</span>
                                    </div>
                                    <div className={styles.cardVerified}>
                                        <BadgeCheck size={14} />
                                        <span>Verified</span>
                                    </div>
                                </div>

                                <div className={styles.cardGameBanner}>
                                    <div className={styles.bannerGlow} />
                                    <div className={styles.bannerContent}>
                                        <div className={styles.bannerAvatar}>
                                            {currentItem && 'thumbnail' in currentItem && currentItem.thumbnail ? (
                                                <img src={currentItem.thumbnail} alt="" className={styles.hotThumb} />
                                            ) : (
                                                <Star size={20} style={{ color: '#f59e0b' }} />
                                            )}
                                        </div>
                                        <div>
                                            <div className={styles.bannerTitle}>
                                                {currentItem && ('title' in currentItem ? currentItem.title : currentItem.label)}
                                            </div>
                                            <div className={styles.bannerGame}>
                                                {currentItem && ('game' in currentItem ? CATEGORY_LABELS[currentItem.game as CategoryKey] : (currentItem.category || 'Genshin Impact'))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardStats}>
                                    <div className={styles.cardStatItem}>
                                        <span className={styles.cardStatLabel}>
                                            {currentItem && 'server' in currentItem ? 'Khu vực' : 'Nhân vật 5★'}
                                        </span>
                                        <span className={styles.cardStatVal}>
                                            {currentItem && 'server' in currentItem ? (currentItem.server || 'Global') : '24'}
                                        </span>
                                    </div>
                                    <div className={styles.cardStatItem}>
                                        <span className={styles.cardStatLabel}>
                                            {currentItem && 'account_type' in currentItem ? 'Xếp hạng' : 'Vũ khí 5★'}
                                        </span>
                                        <span className={styles.cardStatVal}>
                                            {currentItem && 'account_type' in currentItem ? (currentItem.account_type || 'VIP') : '18'}
                                        </span>
                                    </div>
                                    <div className={styles.cardStatItem}>
                                        <span className={styles.cardStatLabel}>Tình trạng</span>
                                        <span className={styles.cardStatVal}>Sẵn sàng</span>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <div className={styles.priceArea}>
                                        <span className={styles.priceLabel}>Giá account</span>
                                        <span className={styles.priceVal}>
                                            {currentItem && typeof currentItem.price === 'number'
                                                ? currentItem.price.toLocaleString() + 'đ'
                                                : currentItem.price}
                                        </span>
                                    </div>

                                    {currentItem && 'id' in currentItem ? (
                                        <motion.button
                                            className={styles.btnBuyAction}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onBuyRequest(currentItem as TradeAccount)}
                                        >
                                            <Handshake size={16} />
                                            <span>Mua ngay</span>
                                        </motion.button>
                                    ) : (
                                        <div className={styles.cardShield}>
                                            <ShieldCheck size={16} style={{ color: 'var(--color-secondary)' }} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination / Dots indicator replacement */}
                        {/* Pagination for Mini List */}
                        <div className={styles.miniList}>
                            {displayItems.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map((item, i) => {
                                const realIndex = currentPage * ITEMS_PER_PAGE + i;
                                return (
                                    <motion.div
                                        key={realIndex}
                                        className={`${styles.miniItem} ${activeIndex === realIndex ? styles.active : ''}`}
                                        onClick={() => setActiveIndex(realIndex)}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={styles.miniDot} style={{
                                            background: realIndex === activeIndex ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'
                                        }} />
                                        <div className={styles.miniInfo}>
                                            <span className={styles.miniLabel}>
                                                {'title' in item ? item.title : item.label}
                                            </span>
                                            <span className={styles.miniRank}>
                                                {'game' in item ? CATEGORY_LABELS[item.game as CategoryKey] : item.rank}
                                            </span>
                                        </div>
                                        <span className={styles.miniPrice}>
                                            {typeof item.price === 'number' ? item.price.toLocaleString() + 'đ' : item.price}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            
                            {displayItems.length > ITEMS_PER_PAGE && (
                                <div className={styles.miniPagination}>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className={styles.pageBtn}
                                    >
                                        ←
                                    </button>
                                    <span className={styles.pageInfo}>
                                        Trang {currentPage + 1} / {Math.ceil(displayItems.length / ITEMS_PER_PAGE)}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(displayItems.length / ITEMS_PER_PAGE) - 1, p + 1))}
                                        disabled={currentPage >= Math.ceil(displayItems.length / ITEMS_PER_PAGE) - 1}
                                        className={styles.pageBtn}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <CoffeeDonateModal
                isOpen={coffeeModalOpen}
                onClose={() => setCoffeeModalOpen(false)}
            />
        </section>
    );
}
