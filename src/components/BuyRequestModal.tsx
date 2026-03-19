import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, CheckCircle2, FileText, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createTicket } from '../api/tickets';
import { getActiveMidmanList, checkPhoneExists } from '../api/profiles';
import type { TradeAccount } from '../types/account';
import { CATEGORY_LABELS } from '../types/account';
import MidmanProfileModal from './MidmanProfileModal';
import { formatPhone } from '../lib/utils';
import styles from './BuyRequestModal.module.css';

interface BuyRequestModalProps {
    account: TradeAccount | null;
    onClose: () => void;
    isLoggedIn: boolean;
}

export default function BuyRequestModal({ account, onClose, isLoggedIn }: BuyRequestModalProps) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [midmanList, setMidmanList] = useState<any[]>([]);
    const [selectedMidmanId, setSelectedMidmanId] = useState('');
    const [showMidmanProfileId, setShowMidmanProfileId] = useState<string | null>(null);

    // Real-time Phone Check
    useEffect(() => {
        if (isLoggedIn || phone.length < 10) {
            setPhoneError('');
            return;
        }
        
        const timer = setTimeout(async () => {
            const exists = await checkPhoneExists(phone);
            if (exists) {
                setPhoneError('Số điện thoại này đã được đăng ký trong hệ thống.');
            } else {
                setPhoneError('');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [phone, isLoggedIn]);

    // Real-time Password Check
    useEffect(() => {
        if (isLoggedIn) return;
        
        if (password && confirmPassword && password !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp.');
        } else if (password && password.length > 0 && password.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự.');
        } else {
            setPasswordError('');
        }
    }, [password, confirmPassword, isLoggedIn]);

    useEffect(() => {
        if (account) {
            getActiveMidmanList().then(res => {
                setMidmanList(res);
                if (res.length > 0) setSelectedMidmanId(res[0].user_id);
            });
        }
    }, [account]);

    if (!account) return null;

    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency', currency: 'VND'
    }).format(account.price);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) return;

        const rawPhone = phone.trim();
        setLoading(true);

        try {
            // Tạo tài khoản ẩn bằng SĐT
            let userId: string | undefined;
            const email = `${rawPhone}@easytrade.com`;
            const finalPassword = isLoggedIn ? `${rawPhone}et88` : password; 

            // Đăng ký trước
            const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({ email, password: finalPassword });

            if (signUpError) {
                if (signUpError.message?.toLowerCase().includes('already registered')) {
                    const { data: signInData, error: signInError } =
                        await supabase.auth.signInWithPassword({ email, password: finalPassword });
                    
                    if (signInError) throw new Error('Lỗi xác thực: ' + signInError.message);
                    userId = signInData.user?.id;
                } else {
                    throw new Error('Lỗi đăng ký: ' + signUpError.message);
                }
            } else {
                userId = signUpData.user?.id;
            }

            // Tạo buy request ticket
            const id = await createTicket({
                account_id: account.id,
                buyer_phone: rawPhone,
                buyer_user_id: userId,
                note: note.trim() || undefined,
                midman_id: selectedMidmanId || undefined,
            });

            setTicketId(id);
        } catch (err: any) {
            alert(err.message || 'Lỗi khi gửi yêu cầu, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

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
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={16} />
                    </button>

                    <AnimatePresence mode="wait">
                        {!ticketId ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Preview tài khoản */}
                                <div className={styles.accountPreview}>
                                    <img
                                        src={account.thumbnail}
                                        alt={account.title}
                                        className={styles.previewThumb}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/1f2937/9ca3af?text=?'; }}
                                    />
                                    <div className={styles.previewInfo}>
                                        <div className={styles.previewTitle}>{account.title}</div>
                                        <div className={styles.previewMeta}>
                                            {CATEGORY_LABELS[account.game]} • {account.server}
                                        </div>
                                    </div>
                                    <div className={styles.previewPrice}>{formattedPrice}</div>
                                </div>

                                <div className={styles.header}>
                                    <div className={styles.headerTitle}>
                                        <div className={styles.headerIcon}>
                                            <Handshake size={24} />
                                        </div>
                                        <div>
                                            <h2>Gửi yêu cầu mua</h2>
                                            <p>Để lại thông tin, Admin sẽ liên hệ qua Zalo/SĐT</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <h2 className={styles.title}>Để lại thông tin</h2>
                                <p className={styles.subtitle}>
                                    Admin sẽ liên hệ với bạn qua số điện thoại để xử lý giao dịch an toàn qua trung gian.
                                </p>

                                {/* PHẦN HIỂN THỊ PHÍ CHO NGƯỜI MUA */}
                                {(account.fee_payer === 'buyer' || account.fee_payer === 'split') && (
                                    <div className={styles.buyerFeeNotice}>
                                        <div className={styles.feeHeader}>Phí trung gian {account.fee_payer === 'split' ? '(Chia đôi 50/50)' : ''}</div>
                                        <div className={styles.feeDetail}>
                                            <span>Bạn cần trả thêm:</span>
                                            <strong>
                                                {new Intl.NumberFormat('vi-VN').format(
                                                    account.fee_payer === 'buyer' ? 
                                                        Math.max(account.price * 0.05, 30000) : 
                                                        Math.max(account.price * 0.05, 30000) / 2
                                                )}đ
                                            </strong>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div>
                                        <label className={styles.fieldLabel}>
                                            Số điện thoại <span>(bắt buộc)</span>
                                        </label>
                                        <input
                                            className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                                            type="tel"
                                            placeholder="VD: 0901234567"
                                            value={phone}
                                            onChange={e => setPhone(formatPhone(e.target.value))}
                                            required
                                            autoFocus
                                            autoComplete="off"
                                        />
                                        {phoneError && <p className={styles.errorText}>{phoneError}</p>}
                                    </div>

                                    {!isLoggedIn && (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div>
                                                    <label className={styles.fieldLabel}>
                                                        Mật khẩu <span>(tối thiểu 6 ký tự)</span>
                                                    </label>
                                                    <input
                                                        className={`${styles.input} ${passwordError && (password.length < 6 || password !== confirmPassword) ? styles.inputError : ''}`}
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        required
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={styles.fieldLabel}>
                                                        Xác nhận mật khẩu
                                                    </label>
                                                    <input
                                                        className={`${styles.input} ${passwordError && password !== confirmPassword ? styles.inputError : ''}`}
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={confirmPassword}
                                                        onChange={e => setConfirmPassword(e.target.value)}
                                                        required
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                            {passwordError && <p className={styles.errorText} style={{ marginTop: -8 }}>{passwordError}</p>}
                                        </>
                                    )}
                                    <div>
                                        <label className={styles.fieldLabel}>
                                            Ghi chú <span>(tùy chọn)</span>
                                        </label>
                                        <textarea
                                            className={`${styles.input} ${styles.textarea}`}
                                            placeholder="Câu hỏi hoặc yêu cầu thêm về tài khoản..."
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label className={styles.fieldLabel}>
                                            Chọn Trung Gian (Midman) <span>(bắt buộc)</span>
                                        </label>
                                        <select
                                            className={styles.input}
                                            value={selectedMidmanId}
                                            onChange={e => setSelectedMidmanId(e.target.value)}
                                            required
                                            style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px auto' }}
                                        >
                                            {midmanList.length === 0 && <option value="">Không có Midman nào đang hoạt động</option>}
                                            {midmanList.map(m => (
                                                <option key={m.id} value={m.user_id}>
                                                    {m.full_name || 'Midman'} • ⭐ {m.rating}/5 ({m.reviewCount} đánh giá)
                                                </option>
                                            ))}
                                        </select>

                                        {selectedMidmanId && (
                                            <button 
                                                type="button" 
                                                onClick={() => setShowMidmanProfileId(selectedMidmanId)}
                                                style={{ marginTop: 8, fontSize: 13, color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                                            >
                                                <Info size={14} /> Xem thông tin & Đánh giá Midman này
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.infoBox}>
                                        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <span>
                                            Số điện thoại sẽ được dùng để tạo tài khoản và nhận link phòng giao dịch khi đến lượt. 
                                            Không cần nhớ mật khẩu.
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-premium ${styles.submitBtn}`}
                                        disabled={loading || !phone.trim() || !!phoneError || !selectedMidmanId || (!isLoggedIn && (password.length < 6 || password !== confirmPassword || !!passwordError))}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner" style={{ width: 16, height: 16 }} />
                                                Đang gửi yêu cầu...
                                            </>
                                        ) : (
                                            <>
                                                <Handshake size={20} />
                                                Gửi yêu cầu mua
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                className={styles.successScreen}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <div className={styles.successIcon}>
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className={styles.successTitle}>Yêu cầu đã được ghi nhận!</h2>
                                <p className={styles.successDesc}>
                                    Admin EasyTrade sẽ liên hệ với bạn qua số <strong style={{ color: 'white' }}>{phone}</strong> trong 
                                    thời gian sớm nhất để hướng dẫn giao dịch trung gian an toàn.
                                </p>
                                <div className={styles.ticketRef}>
                                    <FileText size={13} style={{ display: 'inline', marginRight: 6 }} />
                                    Mã ticket: {ticketId.slice(0, 8).toUpperCase()}
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
                                    Khi đến lượt giao dịch, bạn sẽ nhận được link phòng giao dịch để gặp trực tiếp cùng người bán và admin.
                                </p>
                                <button className="btn-premium" onClick={onClose} style={{ justifyContent: 'center' }}>
                                    Xong, đóng cửa sổ
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {showMidmanProfileId && (
                <MidmanProfileModal 
                    midmanId={showMidmanProfileId}
                    onClose={() => setShowMidmanProfileId(null)}
                />
            )}
        </AnimatePresence>
    );
}
