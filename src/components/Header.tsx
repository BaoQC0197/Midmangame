// src/components/Header.tsx
import { useState } from 'react';

interface HeaderProps {
    isAdmin: boolean;
    onLogin: (email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
}

export default function Header({ isAdmin, onLogin, onLogout }: HeaderProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await onLogin(email, password);
            setEmail('');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const navLinks = [
        { label: 'Trang chủ', href: '#' },
        { label: 'Sản phẩm', href: '#' },
        { label: 'Giới thiệu', href: '#' },
        { label: 'Liên hệ', href: '#' },
    ];

    return (
        <header className="header">
            <div className="container">
                <div className="logo">VPP Ti Anh</div>

                {/* Desktop Nav */}
                <nav className={`menu${menuOpen ? ' open' : ''}`}>
                    {/* Nút đóng menu mobile */}
                    {menuOpen && (
                        <button
                            className="menu-close-btn"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Đóng menu"
                        >
                            ✕
                        </button>
                    )}
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Login / Admin area */}
                    <div className="login-area">
                        {isAdmin ? (
                            <>
                                <span id="welcome-text">Chào admin 👋</span>
                                <button onClick={onLogout} id="logout-btn">Đăng xuất</button>
                            </>
                        ) : (
                            <>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                                <button
                                    id="login-btn"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? '...' : 'Đăng nhập'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Hamburger button — chỉ hiện trên mobile qua CSS */}
                    <button
                        className="hamburger"
                        onClick={() => setMenuOpen(true)}
                        aria-label="Mở menu"
                    >
                        ☰
                    </button>
                </div>
            </div>
        </header>
    );
}
