import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Menu, X, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import Logo from './Logo';
import styles from './MarketHeader.module.css';

interface MarketHeaderProps {
    isAdmin: boolean;
    onLogin: (email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onAdminPanelOpen: () => void;
    isLoggedIn: boolean;
    currentUserPhone?: string | null;
    activeTicket?: any | null;
    onUserHubOpen: () => void;
}

export default function MarketHeader({ isAdmin, isLoggedIn, currentUserPhone, activeTicket, onLogin, onLogout, onAdminPanelOpen, onUserHubOpen }: MarketHeaderProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const adminWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adminOpen && adminWrapperRef.current && !adminWrapperRef.current.contains(event.target as Node)) {
                setAdminOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [adminOpen]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await onLogin(email, password);
            setEmail(''); setPassword(''); setAdminOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const navLinks = [
        { label: 'Tài khoản Game', href: '#product-list' },
        { label: 'Quy trình & Phí', href: '#', onClick: () => setTermsOpen(true) },
    ];

    return (
        <>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
                <div className={`container ${styles.headerInner}`}>
                    <motion.a
                        href="#"
                        className={styles.logo}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className={styles.logoIconWrapper}>
                            <Logo size={24} className={styles.logoIcon} />
                            <motion.div
                                className={styles.logoGlow}
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className={`${styles.logoText} text-gradient`}>EasyTrade</span>
                    </motion.a>

                    <div className={styles.rightSection}>
                        <nav className={styles.desktopNav}>
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className={styles.navLink}
                                    onClick={(e) => {
                                        if (link.onClick) {
                                            e.preventDefault();
                                            link.onClick();
                                        }
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className={styles.headerActions}>
                            {isLoggedIn ? (
                                <div className={styles.adminInfo}>
                                    {currentUserPhone && (
                                        <span className={styles.userPhone} style={{ marginRight: 12, fontSize: 13, opacity: 0.8 }}>
                                            {currentUserPhone}
                                        </span>
                                    )}
                                    {isAdmin && (
                                        <button className={styles.btnAction} onClick={onAdminPanelOpen} title="Bảng điều khiển">
                                            <Settings size={20} />
                                        </button>
                                    )}
                                    <button className={styles.btnAction} onClick={onUserHubOpen} title="Trung tâm của tôi">
                                        <ShoppingBag size={20} />
                                    </button>
                                    {activeTicket && (
                                        <motion.a
                                            href={activeTicket.room_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.liveSessionBtn}
                                            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <div className={styles.liveDot} />
                                            <span>Phòng GD</span>
                                        </motion.a>
                                    )}
                                    <button className={styles.btnAction} onClick={() => setShowLogoutConfirm(true)} title="Đăng xuất">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.adminDropdownWrapper} ref={adminWrapperRef}>
                                    <button className={styles.btnAction} onClick={() => setAdminOpen(!adminOpen)}>
                                        <User size={20} />
                                    </button>
                                    <AnimatePresence>
                                        {adminOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                className={`${styles.adminDropdown} glass-panel`}
                                            >
                                                <div className={styles.dropdownHeader}>
                                                    <ShieldCheck size={18} className={styles.dropdownIcon} />
                                                    <span>Đăng nhập hệ thống</span>
                                                </div>
                                                <div className={styles.dropdownBody}>
                                                    <input type="text" placeholder="Số điện thoại hoặc Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
                                                    <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} autoComplete="current-password" />
                                                    <button className="btn-premium" onClick={handleLogin} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                                        {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <button className={styles.hamburger} onClick={() => setMenuOpen(true)}>
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal Điều khoản & Quy trình */}
            <AnimatePresence>
                {termsOpen && (
                    <div className={styles.modalOverlay} onClick={() => setTermsOpen(false)}>
                        <motion.div
                            className={`${styles.termsModal} glass-panel`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className="text-gradient">Điều khoản & Quy trình</h2>
                                <button className={styles.closeBtn} onClick={() => setTermsOpen(false)}><X size={20} /></button>
                            </div>

                            <div className={styles.modalContent}>
                                <section className={styles.termsSection}>
                                    <h3>1. Quy trình giao dịch trung gian</h3>
                                    <div className={styles.processSteps}>
                                        <div className={styles.step}>
                                            <div className={styles.stepNum}>1</div>
                                            <div className={styles.stepInfo}>
                                                <strong>Đăng bán & Duyệt</strong>
                                                <p>Người bán đăng thông tin. Admin kiểm tra tính xác thực trước khi hiển thị công khai.</p>
                                            </div>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepNum}>2</div>
                                            <div className={styles.stepInfo}>
                                                <strong>Đặt mua & Ghép cặp</strong>
                                                <p>Người mua đặt hàng. Admin liên hệ cả 2 bên để xác nhận thời gian giao dịch.</p>
                                            </div>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepNum}>3</div>
                                            <div className={styles.stepInfo}>
                                                <strong>Giao dịch trực tiếp (Video Call)</strong>
                                                <p>Ba bên tham gia phòng Jitsi. Admin giám sát quá trình đổi thông tin tài khoản.</p>
                                            </div>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepNum}>4</div>
                                            <div className={styles.stepInfo}>
                                                <strong>Kiểm tra & Bàn giao</strong>
                                                <p>Người mua kiểm tra tài khoản, đổi mật khẩu và bảo mật. Admin giữ tiền đảm bảo.</p>
                                            </div>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepNum}>5</div>
                                            <div className={styles.stepInfo}>
                                                <strong>Hoàn tất & Giải ngân</strong>
                                                <p>Sau khi xác nhận an toàn, Admin chuyển tiền cho người bán. Giao dịch kết thúc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className={styles.termsSection}>
                                    <h3>2. Biểu phí dịch vụ trung gian</h3>
                                    <div className={styles.feeBox}>
                                        <div className={styles.feeRow}>
                                            <span>Phí trung gian:</span>
                                            <strong>5% giá trị account</strong>
                                        </div>
                                        <div className={styles.feeRow}>
                                            <span>Tối thiểu:</span>
                                            <strong>30.000đ / giao dịch</strong>
                                        </div>
                                        <div className={styles.feeNote}>
                                            * Người bán có quyền quyết định ai chịu khoản phí này (Người bán, Người mua hoặc Chia đôi).
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.overlay}
                            onClick={() => setMenuOpen(false)}
                        />
                        <motion.nav
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`${styles.mobileNav}`}
                        >
                            <div className={styles.mobileNavHeader}>
                                <span className="text-gradient">Menu</span>
                                <button className={styles.closeBtn} onClick={() => setMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className={styles.mobileLinks}>
                                {navLinks.map((link) => (
                                    <a key={link.label} href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* Modal Xác nhận đăng xuất */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
                        <motion.div
                            className={`${styles.confirmModal} glass-panel`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.confirmHeader}>
                                <AlertCircle size={24} className={styles.confirmIcon} />
                                <h3>Xác nhận đăng xuất</h3>
                            </div>
                            <p className={styles.confirmText}>Bạn có chắc chắn muốn thoát khỏi hệ thống không?</p>
                            <div className={styles.confirmActions}>
                                <button className={styles.btnCancel} onClick={() => setShowLogoutConfirm(false)}>
                                    Hủy bỏ
                                </button>
                                <button
                                    className={styles.btnLogoutConfirm}
                                    onClick={() => {
                                        onLogout();
                                        setShowLogoutConfirm(false);
                                    }}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
