import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, CheckCircle2, FileText, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createTicket } from '../api/tickets';
import type { TradeAccount } from '../types/account';
import { CATEGORY_LABELS } from '../types/account';
import styles from './BuyRequestModal.module.css';

interface BuyRequestModalProps {
    account: TradeAccount | null;
    onClose: () => void;
    isLoggedIn: boolean;
}

export default function BuyRequestModal({ account, onClose, isLoggedIn }: BuyRequestModalProps) {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [ticketId, setTicketId] = useState<string | null>(null);

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
                                            className={styles.input}
                                            type="tel"
                                            placeholder="VD: 0901234567"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {!isLoggedIn && (
                                        <div>
                                            <label className={styles.fieldLabel}>
                                                Mật khẩu <span>(tối thiểu 6 ký tự)</span>
                                            </label>
                                            <input
                                                className={styles.input}
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
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
                                        disabled={loading || !phone.trim() || (!isLoggedIn && password.length < 6)}
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
        </AnimatePresence>
    );
}
