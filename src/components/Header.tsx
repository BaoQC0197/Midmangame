// src/components/Header.tsx
import { useState } from 'react';

interface HeaderProps {
    isAdmin: boolean;
    cartCount: number;
    onLogin: (email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onCartOpen: () => void;
}

export default function Header({ isAdmin, cartCount, onLogin, onLogout, onCartOpen }: HeaderProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await onLogin(email, password);
            setEmail('');
            setPassword('');
            setAdminOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const navLinks = [
        { label: 'Trang chủ', href: '#' },
        { label: 'Sản phẩm', href: '#product-list' },
        { label: 'Giới thiệu', href: '#about' },
        { label: 'Liên hệ', href: '#contact' },
    ];

    return (
        <header className="header">
            <div className="header-inner container">
                {/* Logo */}
                <a href="#" className="logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">VPP <span className="logo-accent">Ti Anh</span></span>
                </a>

                {/* Desktop Nav */}
                <nav className={`nav-menu${menuOpen ? ' open' : ''}`}>
                    <button className="nav-close" onClick={() => setMenuOpen(false)}>✕</button>
                    {navLinks.map((link) => (
                        <a key={link.label} href={link.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Right side actions */}
                <div className="header-actions">
                    {/* Cart button */}
                    <button className="cart-btn" onClick={onCartOpen} aria-label="Giỏ hàng">
                        🛒
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                        )}
                    </button>

                    {/* Admin login area */}
                    <div className="admin-dropdown-wrapper">
                        {isAdmin ? (
                            <div className="admin-info">
                                <span className="admin-greeting">👋 Admin</span>
                                <button className="btn-logout" onClick={onLogout}>Đăng xuất</button>
                            </div>
                        ) : (
                            <>
                                <button
                                    className="btn-admin-toggle"
                                    onClick={() => setAdminOpen((v) => !v)}
                                    title="Đăng nhập Admin"
                                >
                                    🔑
                                </button>
                                {adminOpen && (
                                    <div className="admin-dropdown">
                                        <p className="admin-dropdown-title">Đăng nhập Admin</p>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        />
                                        <button
                                            className="btn-login-submit"
                                            onClick={handleLogin}
                                            disabled={loading}
                                        >
                                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button
                        className="hamburger"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Mở menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
        </header>
    );
}
