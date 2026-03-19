import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp } from 'lucide-react';

import { getAccounts, addAccount } from './api/accounts';
import { uploadImages } from './api/storage';
import { getCategories } from './api/categories';
import { supabase, ADMIN_EMAIL } from './lib/supabase';

// UI Components
import MarketHeader from './components/MarketHeader';
import MarketHero from './components/MarketHero';
import MarketAccountCard from './components/MarketAccountCard';
import FilterHub from './components/FilterHub';
import SellAccountModal from './components/SellAccountModal';
import WelcomePopup from './components/WelcomePopup';
import BuyRequestModal from './components/BuyRequestModal';
import AccountDetailModal from './components/AccountDetailModal';
import TradeRoomBanner from './components/TradeRoomBanner';
import type { TransactionTicket } from './types/ticket';
import TradeRoomView from './components/TradeRoomView';
import Toast, { type ToastType } from './components/Toast';
import UserHub from './components/UserHub';
import ApplyMidmanModal from './components/ApplyMidmanModal';
import MidmanPanel from './components/MidmanPanel';
import MiddlemanHub from './components/MiddlemanHub';
import Logo from './components/Logo';
import UserProfileModal from './components/UserProfileModal';
import styles from './App.module.css';
import { getProfile } from './api/profiles';

// Types


export default function App() {
    const queryClient = useQueryClient();
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [selectedGame, setSelectedGame] = useState<string>('All');
    const [sortBy, setSortBy] = useState<string>('price_asc');
    const [feePayerFilter, setFeePayerFilter] = useState<string>('All');
    const [accTypeFilter, setAccTypeFilter] = useState<string>('All');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [buyModalAccount, setBuyModalAccount] = useState<any>(null);
    const [detailModalAccount, setDetailModalAccount] = useState<any>(null);
    const [showTradeRoom, setShowTradeRoom] = useState(false);
    const [activeTradeTicket, setActiveTradeTicket] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [userHubOpen, setUserHubOpen] = useState(false);
    const [userProfileOpen, setUserProfileOpen] = useState(false);
    const [applyMidmanOpen, setApplyMidmanOpen] = useState(false);
    const [midmanPanelOpen, setMidmanPanelOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as ToastType });

    // --- DATA FETCHING ---
    const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: getAccounts,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ show: true, message, type });
    };

    // Auth Effect
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const loggedInUser = session?.user ?? null;
            setUser(loggedInUser);
            if (loggedInUser?.email === ADMIN_EMAIL) setIsAdmin(true);
            
            if (loggedInUser) {
                getProfile(loggedInUser.id).then(prof => setUserProfile(prof));
            } else {
                setUserProfile(null);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const loggedInUser = session?.user ?? null;
            setUser(loggedInUser);
            setIsAdmin(loggedInUser?.email === ADMIN_EMAIL);

            if (loggedInUser) {
                getProfile(loggedInUser.id).then(prof => setUserProfile(prof));
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load active ticket khi user đăng nhập
    useEffect(() => {
        const loadActive = () => {
            if (user && !isAdmin) {
                import('./api/tickets').then(({ getMyActiveTicket }) => {
                    getMyActiveTicket(user.id).then(setActiveTradeTicket).catch(() => setActiveTradeTicket(null));
                });
            } else {
                setActiveTradeTicket(null);
            }
        };

        loadActive();

        // Real-time subscription để hiện banner ngay khi admin chuyển status sang 'trading'
        if (user && !isAdmin) {
            const channel = supabase
                .channel('trading_notifications')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'transaction_tickets' },
                    (payload: any) => {
                        // Nếu ticket này liên quan đến user và status mới là trading hoặc vừa kết thúc
                        const t = payload.new;
                        if (t.buyer_user_id === user.id || t.seller_user_id === user.id || t.midman_id === user.id) {
                            loadActive();
                        }
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [user, isAdmin]);

    const currentUserPhone = useMemo(() => {
        if (!user || !user.email) return null;
        const DOMAINS = ['@easytrade.com'];
        const match = DOMAINS.find(d => user.email.endsWith(d));
        if (match && user.email !== ADMIN_EMAIL) {
            return user.email.replace(match, '');
        }
        return null;
    }, [user]);

    // --- AUTH LOGIC ---
    const handleLogin = async (rawInput: string, password: string) => {
        const email = rawInput.includes('@') ? rawInput : `${rawInput}@easytrade.com`;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error('Sai thông tin đăng nhập');
        showToast(email === ADMIN_EMAIL ? 'Chào mừng trở lại, Admin!' : 'Đăng nhập thành công!');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
        localStorage.clear();
        sessionStorage.clear();
        showToast('Đã đăng xuất');
    };

    const handleSellSubmit = async (formData: any) => {
        setIsSubmittingTicket(true);
        showToast('Hệ thống đang xử lý và tải hình ảnh lên...', 'info');
        try {
            // Xử lý tạo tài khoản hoặc đăng nhập ngầm qua SĐT
            let currentUserId = user?.id;

            if (!user) {
                if (!formData.phone) throw new Error("Vui lòng nhập số điện thoại.");
                const email = `${formData.phone}@easytrade.com`;
                const password = formData.password || formData.phone;

                // Thử đăng ký trước
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

                if (signUpError) {
                    if (signUpError.message?.toLowerCase().includes('already registered')) {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                        if (signInError) throw new Error("Mật khẩu không đúng cho tài khoản này.");
                        currentUserId = signInData.user?.id;
                    } else {
                        throw new Error("Lỗi xác thực: " + signUpError.message);
                    }
                } else {
                    currentUserId = signUpData.user?.id;
                }
            }

            const finalDesc = `[${formData.accountType}] - Server: ${formData.server}\nBind: ${formData.bindStatus}\nLiên hệ: ${formData.phone || currentUserPhone}\n\n${formData.description}`;

            // Upload mảng Files vật lý lên Supabase Storage
            const imageUrls = await uploadImages(formData.images);
            if (imageUrls.length === 0) throw new Error('Vui lòng tải lên ít nhất 1 ảnh');

            await addAccount({
                title: formData.title,
                thumbnail: imageUrls[0], // Ảnh đầu tiên làm Thumbnail
                images: imageUrls,       // Lưu danh sách đường dẫn URL
                price: parseFloat(formData.price),
                description: finalDesc,
                game: formData.game,
                server: formData.server,
                account_type: formData.accountType,
                is_sold: false,
                seller_id: currentUserId,
                seller_phone: formData.phone || currentUserPhone,
                fee_payer: formData.feePayer
            } as any);
            showToast('Tạo ticket ký gửi thành công! Admin sẽ duyệt sớm nhất.', 'success');
            setSellModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        } catch (error: any) {
            console.error('Lỗi khi tạo ticket ký gửi:', error);
            showToast(error.message || 'Lỗi gửi ticket. Vui lòng thử lại sau!', 'error');
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    // --- FILTER LOGIC ---
    /* const games = useMemo(() => {
        const uniqueGames = Array.from(new Set(accounts.map(acc => acc.game)));
        return ['All', ...uniqueGames];
    }, [accounts]); */

    const categoryMap = useMemo(() => {
        const map: Record<string, string> = {};
        categories.forEach(c => { map[c.id] = c.name; });
        return map;
    }, [categories]);

    const filteredAccounts = useMemo(() => {
        let base = accounts.filter(acc => {
            const gameName = categoryMap[acc.game] || acc.game; // Fallback to ID if not found
            const matchesSearch = !searchQuery ||
                acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gameName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGame = selectedGame === 'All' ||
                acc.game === selectedGame ||
                categories.filter(c => c.group_id === selectedGame).some(c => c.id === acc.game);

            // Fee Payer Filter
            const matchesFee = feePayerFilter === 'All' || acc.fee_payer === feePayerFilter;

            // Account Type Filter
            const matchesType = accTypeFilter === 'All' ||
                (acc.account_type && acc.account_type.toLowerCase().includes(accTypeFilter.toLowerCase())) ||
                (acc.description && acc.description.toLowerCase().includes(accTypeFilter.toLowerCase()));

            // Price Range Filter
            const min = minPrice ? parseFloat(minPrice) : 0;
            const max = maxPrice ? parseFloat(maxPrice) : Infinity;
            const matchesPrice = acc.price >= min && acc.price <= max;

            const isApproved = acc.status === 'approved';

            return matchesSearch && matchesGame && matchesFee && matchesType && matchesPrice && isApproved;
        });

        // Sắp xếp
        return [...base].sort((a, b) => {
            // Luôn ưu tiên hàng chưa bán
            if (a.is_sold !== b.is_sold) return a.is_sold ? 1 : -1;

            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

            if (a.has_active_ticket !== b.has_active_ticket) return a.has_active_ticket ? 1 : -1;
            return 0;
        });
    }, [accounts, searchQuery, selectedGame, sortBy, feePayerFilter, accTypeFilter, minPrice, maxPrice]);

    // Reset trang khi bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedGame, feePayerFilter, accTypeFilter, minPrice, maxPrice, sortBy]);

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAccounts.slice(start, start + itemsPerPage);
    }, [filteredAccounts, currentPage, itemsPerPage]);

    return (
        <div className={styles.app}>
            <MarketHeader
                isAdmin={isAdmin}
                isLoggedIn={!!user}
                currentUserPhone={currentUserPhone}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onAdminPanelOpen={() => setAdminPanelOpen(true)}
                activeTicket={activeTradeTicket}
                onUserHubOpen={() => setUserHubOpen(true)}
                onUserProfileOpen={() => setUserProfileOpen(true)}
                onOpenApplyMidman={() => setApplyMidmanOpen(true)}
                onOpenTradeRoom={() => setShowTradeRoom(true)}
            />
            {userProfile?.role === 'midman' && (
                <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1000 }}>
                    <button 
                        className="btn-premium" 
                        onClick={() => setMidmanPanelOpen(true)}
                        style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)', borderRadius: 20 }}
                    >
                        Midman Panel
                    </button>
                </div>
            )}

            <MarketHero
                onOpenSellModal={() => setSellModalOpen(true)}
                onBuyRequest={(acc) => setBuyModalAccount(acc)}
                accounts={accounts}
            />

            <main id="product-list" className="container">
                <FilterHub
                    categories={categories}
                    selectedGame={selectedGame}
                    onSelectedGameChange={setSelectedGame}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    feePayer={feePayerFilter}
                    onFeePayerChange={setFeePayerFilter}
                    accType={accTypeFilter}
                    onAccTypeChange={setAccTypeFilter}
                    minPrice={minPrice}
                    onMinPriceChange={setMinPrice}
                    maxPrice={maxPrice}
                    onMaxPriceChange={setMaxPrice}
                />

                {isLoadingAccounts ? (
                    <div className={styles.loadingState}>
                        <div className="spinner" />
                        <p>Đang quét dữ liệu sàn giao dịch...</p>
                    </div>
                ) : (
                    <div className={styles.accountGrid}>
                        <AnimatePresence mode="popLayout">
                            {paginatedAccounts.map((account) => (
                                <MarketAccountCard
                                    key={account.id}
                                    account={account}
                                    onClick={(acc) => setDetailModalAccount(acc)}
                                    onBuyRequest={(acc) => setBuyModalAccount(acc)}
                                />
                            ))}
                        </AnimatePresence>
                        {filteredAccounts.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>Không tìm thấy tài khoản nào phù hợp với yêu cầu của bạn.</p>
                                <button onClick={() => { setSearchQuery(''); setSelectedGame('All'); }}>Đặt lại bộ lọc</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Floating Trade Banner */}
                {activeTradeTicket && !showTradeRoom && (
                    <div onClick={() => setShowTradeRoom(true)} style={{ cursor: 'pointer' }}>
                        <TradeRoomBanner ticket={activeTradeTicket} />
                    </div>
                )}

                <AnimatePresence>
                    {showTradeRoom && activeTradeTicket && (
                        <TradeRoomView
                            ticket={activeTradeTicket}
                            user={user}
                            userProfile={userProfile}
                            onClose={() => setShowTradeRoom(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={styles.pageBtn}
                        >
                            Trước
                        </button>

                        <div className={styles.pageNumbers}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={styles.pageBtn}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </main>

            {isAdmin && (
                <MiddlemanHub
                    open={adminPanelOpen}
                    onClose={() => setAdminPanelOpen(false)}
                    accounts={accounts}
                    showToast={showToast}
                    onOpenTradeRoom={(t: TransactionTicket) => {
                        setActiveTradeTicket(t);
                        setShowTradeRoom(true);
                        setAdminPanelOpen(false);
                    }}
                />
            )}

            <SellAccountModal
                open={sellModalOpen}
                onClose={() => setSellModalOpen(false)}
                onSubmit={handleSellSubmit}
                isSubmitting={isSubmittingTicket}
                currentUserPhone={currentUserPhone}
                isLoggedIn={!!user}
            />

            <BuyRequestModal
                account={buyModalAccount}
                onClose={() => setBuyModalAccount(null)}
                isLoggedIn={!!user}
            />

            <AccountDetailModal
                account={detailModalAccount}
                onClose={() => setDetailModalAccount(null)}
                onBuy={(acc) => {
                    setDetailModalAccount(null);
                    setBuyModalAccount(acc);
                }}
            />

            {user && (
                <UserHub
                    open={userHubOpen}
                    onClose={() => setUserHubOpen(false)}
                    userId={user.id}
                    onOpenTradeRoom={(t: TransactionTicket) => {
                        setActiveTradeTicket(t);
                        setShowTradeRoom(true);
                        setUserHubOpen(false);
                    }}
                />
            )}

            {user && (
                <UserProfileModal
                    open={userProfileOpen}
                    onClose={() => setUserProfileOpen(false)}
                    userId={user.id}
                    showToast={showToast}
                />
            )}

            <ApplyMidmanModal
                open={applyMidmanOpen}
                onClose={() => setApplyMidmanOpen(false)}
                userId={user?.id}
                showToast={showToast}
            />

            {userProfile?.role === 'midman' && (
                <MidmanPanel
                    open={midmanPanelOpen}
                    onClose={() => setMidmanPanelOpen(false)}
                    showToast={showToast}
                />
            )}

            {/* Modal Tham gia nhanh qua Link (Xử lý /trade/[ID]) */}
            <QuickJoinModal />

            <WelcomePopup 
                onOpenSellModal={() => setSellModalOpen(true)} 
                onOpenApplyMidman={() => setApplyMidmanOpen(true)} 
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(t => ({ ...t, show: false }))}
            />

            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.safetyBanner}>
                        <div className={styles.safetyItem}>
                            <div className={styles.safetyIcon}><ShieldCheck size={24} /></div>
                            <div className={styles.safetyText}>
                                <strong>An toàn</strong>
                                <span>Giao dịch bảo mật 100%</span>
                            </div>
                        </div>
                        <div className={styles.safetyItem}>
                            <div className={styles.safetyIcon}><Zap size={24} /></div>
                            <div className={styles.safetyText}>
                                <strong>Linh hoạt</strong>
                                <span>Hỗ trợ 24/7 siêu tốc</span>
                            </div>
                        </div>
                        <div className={styles.safetyItem}>
                            <div className={styles.safetyIcon}><TrendingUp size={24} /></div>
                            <div className={styles.safetyText}>
                                <strong>Tiết kiệm</strong>
                                <span>Phí trung gian thấp nhất</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Logo size={32} style={{ color: 'var(--color-primary)' }} />
                                <h3 className="text-gradient" style={{ margin: 0 }}>EasyTrade</h3>
                            </div>
                            <p>Hệ thống trung gian tài khoản chuyên nghiệp, bảo mật tuyệt đối.</p>
                        </div>
                        <div className={styles.footerLinks}>
                            <div className={styles.footerCol}>
                                <h4>Khám phá</h4>
                                <a href="#">Mua tài khoản</a>
                                <a href="#">Ký gửi trung gian</a>
                                <a href="#">Bảng giá dịch vụ</a>
                            </div>
                            <div className={styles.footerCol}>
                                <h4>Hệ thống</h4>
                                <a href="#">Điều khoản sử dụng</a>
                                <a href="#">Chính sách bảo mật</a>
                                <a href="#">Liên hệ hỗ trợ</a>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <p>© 2024 EasyTrade Middleman Service. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// --- UTILITY COMPONENTS ---
function QuickJoinModal() {
    const [ticket, setTicket] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/trade/')) {
            const id = path.split('/trade/')[1];
            if (id) {
                setLoading(true);
                setShow(true);
                // Fetch ticket info công khai
                supabase
                    .from('transaction_tickets')
                    .select(`*, trade_accounts(name, price)`)
                    .eq('id', id)
                    .single()
                    .then(({ data }) => {
                        if (data && data.status === 'trading') {
                            setTicket(data);
                        }
                        setLoading(false);
                    });
            }
        }
    }, []);

    if (!show) return null;

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 2000 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${styles.modalContent} glass-panel`}
                style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}
            >
                <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', margin: '0 auto 20px' }} />
                <h2 style={{ marginBottom: 10 }}>Tham gia giao dịch</h2>
                {loading ? (
                    <p>Đang tìm kiếm thông tin phòng...</p>
                ) : ticket ? (
                    <>
                        <p style={{ color: 'var(--color-text-dim)', marginBottom: 24 }}>
                            Bạn đang được mời tham gia phòng giao dịch trung gian cho tài khoản:
                            <br /><b style={{ color: 'white' }}>{ticket.trade_accounts?.name}</b>
                        </p>
                        <button
                            className="btn-premium"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}
                            onClick={() => {
                                setShow(false);
                                window.history.pushState({}, '', '/');
                                // Force reload or just let the banner handle it if they are logged in.
                                window.location.reload(); 
                            }}
                        >
                            Vào phòng chat ngay
                        </button>
                    </>
                ) : (
                    <p style={{ color: '#ef4444' }}>Phòng giao dịch này không tồn tại hoặc đã kết thúc.</p>
                )}
                <button
                    onClick={() => { setShow(false); window.history.pushState({}, '', '/'); }}
                    style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', fontSize: 13 }}
                >
                    Đóng và quay về trang chủ
                </button>
            </motion.div>
        </div>
    );
}
