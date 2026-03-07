/**
 * src/components/Header.tsx
 * 
 * THANH TIÊU ĐỀ (Navigation Bar)
 * ------------------------------
 * Bím ví file này như "Bảng chỉ dẫn" của cửa hàng. Nó giúp khách 
 * tìm đường, xem giỏ hàng và giúp Admin đăng nhập vào hệ thống.
 */
import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import logoImg from '../assets/logo.png';

interface HeaderProps {
    isAdmin: boolean;
    onLogin: (email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onAdminPanelOpen: () => void;
}

export default function Header({ isAdmin, onLogin, onLogout, onAdminPanelOpen }: HeaderProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // Trạng thái đóng/mở menu trên điện thoại
    const [adminOpen, setAdminOpen] = useState(false); // Trạng thái đóng/mở ô đăng nhập Admin
    const [scrolled, setScrolled] = useState(false); // Theo dõi xem người dùng có đang cuộn trang không

    const adminWrapperRef = useRef<HTMLDivElement>(null);

    // Kích ra ngoài để đóng adminOpen
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adminOpen && adminWrapperRef.current && !adminWrapperRef.current.contains(event.target as Node)) {
                setAdminOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [adminOpen]);

    // HIỆU ỨNG: Khi cuộn chuột xuống thì Header sẽ đổi kiểu (thêm đổ bóng)
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

    // Danh sách các mục menu
    const navLinks = [
        { label: 'Trang chủ', href: '#' },
        { label: 'Sản phẩm', href: '#product-list' },
        { label: 'Giới thiệu', href: '#about' },
        { label: 'Liên hệ', href: '#contact' },
    ];

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            {/* ── THANH HEADER CHÍNH ────────────────────────────────────────── */}
            <header className={`${styles.header}${scrolled ? ' ' + styles.scrolled : ''}`}>
                <div className={styles.headerInner}>
                    {/* Logo dự án */}
                    <a href="#" className={styles.logo}>
                        <img src={logoImg} alt="VPP Ti Anh logo" className={styles.logoImg} />
                        <span className={styles.logoText}>VPP <span className={styles.logoAccent}>Ti Anh</span></span>
                    </a>

                    {/* Menu cho máy tính (ẩn trên điện thoại) */}
                    <nav className={styles.desktopNav}>
                        {navLinks.map((link) => (
                            <a key={link.label} href={link.href} className={styles.navLink}>
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Các nút hành động bên phải (Admin, Menu mobile) */}
                    <div className={styles.headerActions}>

                        {/* Khu vực đăng nhập cho Admin */}
                        <div className={styles.adminDropdownWrapper} ref={adminWrapperRef}>
                            {isAdmin ? (
                                <div className={styles.adminInfo}>
                                    <button className={styles.btnAdminPortal} onClick={onAdminPanelOpen} title="Bảng quản trị chuyên nghiệp">
                                        <span className={styles.btnIcon}>⚙️</span>
                                        <span className={styles.btnText}>Quản trị</span>
                                    </button>
                                    <button className={styles.btnLogout} onClick={onLogout} title="Đăng xuất">
                                        <span className={styles.btnIcon}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                            </svg>
                                        </span>
                                        <span className={styles.btnText}>Đăng xuất</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button className={styles.btnAdminToggle} onClick={() => setAdminOpen((v) => !v)} title="Đăng nhập Admin">🔑</button>
                                    {adminOpen && (
                                        <div className={styles.adminDropdown}>
                                            <p className={styles.adminDropdownTitle}>Đăng nhập Admin</p>
                                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                            <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                                            <button className={styles.btnLoginSubmit} onClick={handleLogin} disabled={loading}>
                                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Nút ba gạch để mở menu trên điện thoại */}
                        <button className={styles.hamburger} onClick={() => setMenuOpen(true)} aria-label="Mở menu">☰</button>
                    </div>
                </div>
            </header>

            {/* ── MENU TRƯỢT TRÊN MOBILE ── */}
            <nav className={`${styles.mobileNav}${menuOpen ? ' ' + styles.open : ''}`} aria-hidden={!menuOpen}>
                <button className={styles.navClose} onClick={closeMenu}>✕</button>

                <div className={styles.navBanner}>
                    <div className={styles.navBannerBg} />
                    <img src={logoImg} alt="VPP Ti Anh logo" className={styles.navBannerLogo} />
                    <div className={styles.navBannerText}>
                        <strong>VPP Ti Anh</strong>
                        <span>Văn phòng phẩm chất lượng</span>
                    </div>
                </div>

                <div className={styles.navLinksSection}>
                    {navLinks.map((link) => (
                        <a key={link.label} href={link.href} className={styles.mobileNavLink} onClick={closeMenu}>
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className={styles.navFooter}>
                    <span>📞 Liên hệ đặt hàng</span>
                    <span>🕐 8:00 – 20:00 mỗi ngày</span>
                </div>
            </nav>

            {/* Lớp nền mờ khi mở menu mobile, bấm vào đây cũng đóng được menu */}
            {menuOpen && <div className={styles.navOverlay} onClick={closeMenu} aria-hidden="true" />}
        </>
    );
}
