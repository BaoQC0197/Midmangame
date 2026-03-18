import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Link as LinkIcon, AlertCircle, User, Briefcase, Percent, Image as ImageIcon, HelpCircle, Phone, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { applyForMidman } from '../api/profiles';
import { uploadImages } from '../api/storage';
import styles from './SellAccountModal.module.css';

interface ApplyMidmanModalProps {
    open: boolean;
    onClose: () => void;
    userId: string | undefined;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ApplyMidmanModal({ open, onClose, userId, showToast }: ApplyMidmanModalProps) {
    const [fullName, setFullName] = useState('');
    const [cdcd, setCccd] = useState('');
    const [fbUrl, setFbUrl] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [cccdFront, setCccdFront] = useState<File | null>(null);
    const [cccdBack, setCccdBack] = useState<File | null>(null);
    const [agreedTc, setAgreedTc] = useState(false);
    const [showFeeTooltip, setShowFeeTooltip] = useState(false);

    // Auth fields
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Không nhất thiết cần userId từ prop, sẽ tạo auth nếu chưa có
        if (!userId && (!phone || !password)) {
            showToast('Bạn chưa đăng nhập. Vui lòng nhập Số điện thoại và Mật khẩu để hệ thống tạo tài khoản.', 'error');
            return;
        }

        if (!userId && password !== confirmPassword) {
            showToast('Mật khẩu và Xác nhận mật khẩu không khớp. Vui lòng thử lại.', 'error');
            return;
        }

        if (!fullName || !cdcd || !fbUrl || !workingHours || !cccdFront || !cccdBack) {
            showToast('Vui lòng điền đầy đủ tất cả thông tin và hình ảnh', 'error');
            return;
        }

        if (!agreedTc) {
            showToast('Vui lòng kiểm tra và đồng ý T&C của hệ thống', 'error');
            return;
        }

        setIsSubmitting(true);
        showToast('Hệ thống đang xử lý và tải hình Căn Cước lên...', 'info');
        
        try {
            let currentUserId = userId;

            // Xử lý tạo/đăng nhập nếu chưa có user
            if (!currentUserId && phone) {
                const email = `${phone}@easytrade.com`;
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

                if (signUpError) {
                    if (signUpError.message?.toLowerCase().includes('already registered')) {
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                        if (signInError) throw new Error("Số điện thoại này đã tồn tại mật khẩu khác. Vui lòng kiểm tra lại.");
                        currentUserId = signInData.user?.id || '';
                    } else {
                        throw new Error("Lỗi xác thực: " + signUpError.message);
                    }
                } else {
                    currentUserId = signUpData.user?.id || '';
                }
            }

            if (!currentUserId) throw new Error("Chưa thể xác thực tài khoản.");
            const [frontUrl, backUrl] = await Promise.all([
                uploadImages([cccdFront]),
                uploadImages([cccdBack])
            ]);

            if (!frontUrl[0] || !backUrl[0]) {
                throw new Error("Không thể tải lên hình ảnh CCCD. Vui lòng thử lại!");
            }

            await applyForMidman(
                currentUserId,
                cdcd,
                fbUrl,
                fullName,
                frontUrl[0],
                backUrl[0],
                '60%', // Hardcode 60% theo yêu cầu hệ thống
                workingHours
            );

            showToast('Gửi đơn ứng tuyển thành công! Vui lòng chờ Admin duyệt.', 'success');
            onClose();
            // Reset states
            setFullName(''); setCccd(''); setFbUrl('');
            setWorkingHours('');
            setCccdFront(null); setCccdBack(null);
            setAgreedTc(false);
            setPhone(''); setPassword('');
        } catch (error: any) {
            showToast(error.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className={styles.overlay} style={{ zIndex: 1100 }}>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={styles.modal}
                        style={{ zIndex: 1101, maxWidth: 650, maxHeight: '95vh', overflowY: 'auto' }}
                    >
                        <div className={styles.header}>
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                                    <ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} />
                                    Ứng tuyển Midman
                                </h2>
                                <p style={{ marginTop: 5 }}>
                                    Đăng ký trở thành trung gian uy tín trên hệ thống EasyTrade.
                                </p>
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            <form id="applyMidmanForm" onSubmit={handleSubmit} className={styles.formGroup}>

                                {!userId && (
                                    <>
                                        <div style={{ padding: 16, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, marginBottom: 16 }}>
                                            <p style={{ fontSize: 13, color: '#93c5fd', marginBottom: 12, lineHeight: 1.5 }}>
                                                Bạn chưa đăng nhập. Vui lòng nhập thông tin dưới đây để tạo tài khoản hoặc đăng nhập trực tiếp (nếu số điện thoại đã tồn tại).
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                                                    <label>
                                                        <Phone size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                        Số Điện Thoại
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        required={!userId}
                                                        className={styles.input}
                                                        placeholder="SĐT dùng làm User"
                                                        value={phone}
                                                        onChange={e => setPhone(e.target.value)}
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                <div className={styles.field}>
                                                    <label>
                                                        <Lock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                        Mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required={!userId}
                                                        className={styles.input}
                                                        placeholder="Tối thiểu 6 ký tự"
                                                        value={password}
                                                        onChange={e => setPassword(e.target.value)}
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                                <div className={styles.field}>
                                                    <label>
                                                        <Lock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                        Xác nhận mật khẩu
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required={!userId}
                                                        className={styles.input}
                                                        placeholder="••••••••"
                                                        value={confirmPassword}
                                                        onChange={e => setConfirmPassword(e.target.value)}
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className={styles.field}>
                                        <label>
                                            <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                            Họ và tên (Đúng CCCD)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.input}
                                            placeholder="VD: NGUYEN VAN A"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label>
                                            <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                            Số CCCD / CMND
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.input}
                                            placeholder="Cấp theo định dạng quốc gia"
                                            value={cdcd}
                                            onChange={e => setCccd(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className={styles.field}>
                                        <label style={{ display: 'flex', alignItems: 'center' }}>
                                            <Percent size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                            Hoa hồng mặc định
                                            <span 
                                                style={{ cursor: 'pointer', color: 'var(--color-primary)', marginLeft: 6, display: 'inline-flex', position: 'relative' }}
                                                onClick={() => setShowFeeTooltip(!showFeeTooltip)}
                                            >
                                                <HelpCircle size={14} />
                                                <AnimatePresence>
                                                    {showFeeTooltip && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: '100%',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                marginBottom: 8,
                                                                backgroundColor: '#1f2937', /* surface */
                                                                color: 'white',
                                                                padding: '8px 12px',
                                                                borderRadius: 8,
                                                                fontSize: 12,
                                                                width: 240,
                                                                textAlign: 'center',
                                                                zIndex: 10,
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                                                fontWeight: 'normal',
                                                                lineHeight: 1.4
                                                            }}
                                                        >
                                                            Chính sách hệ thống: <strong style={{color:'#34d399'}}>Tỷ lệ 6/4</strong>.<br/>Midman nhận <strong style={{color:'#34d399'}}>60%</strong> và Hệ thống nhận 40% phí giao dịch khi ứng tuyển thành công.
                                                            {/* Mũi tên trỏ xuống */}
                                                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: 5, borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent' }}></div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </span>
                                        </label>
                                        <div 
                                            className={styles.input} 
                                            style={{ 
                                                backgroundColor: 'rgba(0,0,0,0.4)', 
                                                color: 'var(--color-primary)', 
                                                fontWeight: 'bold', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                userSelect: 'none',
                                                border: '1px dashed var(--color-primary)'
                                            }}
                                        >
                                            60% (Midman 6 - Hệ thống 4)
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label>
                                            <Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                            Khung giờ làm việc
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.input}
                                            placeholder="Ví dụ: 08:00 - 23:00 hàng ngày"
                                            value={workingHours}
                                            onChange={e => setWorkingHours(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Hình Căn Cước Công Dân Để Đối Chiếu (Dung lượng nhỏ hơn 5MB)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                id="cccd-front"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => setCccdFront(e.target.files?.[0] || null)}
                                            />
                                            <label htmlFor="cccd-front" className={styles.uploadLabel} style={{ padding: '20px' }}>
                                                {cccdFront ? (
                                                    <img src={URL.createObjectURL(cccdFront)} alt="Mặt trước" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={24} />
                                                        <span style={{ fontSize: 13 }}>Tải lên Mặt Trước</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                id="cccd-back"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => setCccdBack(e.target.files?.[0] || null)}
                                            />
                                            <label htmlFor="cccd-back" className={styles.uploadLabel} style={{ padding: '20px' }}>
                                                {cccdBack ? (
                                                    <img src={URL.createObjectURL(cccdBack)} alt="Mặt sau" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={24} />
                                                        <span style={{ fontSize: 13 }}>Tải lên Mặt Sau</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        <LinkIcon size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                        Link Facebook Cá Nhân
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        className={styles.input}
                                        placeholder="https://facebook.com/..."
                                        value={fbUrl}
                                        onChange={e => setFbUrl(e.target.value)}
                                    />
                                    <p className={styles.hintText} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                        <AlertCircle size={12} /> Yêu cầu Facebook chính chủ, hoạt động thường xuyên. Admin sẽ xác thực Facebook của bạn.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 10 }}>
                                    <input
                                        type="checkbox"
                                        id="agreeTc"
                                        required
                                        checked={agreedTc}
                                        onChange={e => setAgreedTc(e.target.checked)}
                                        style={{ width: 18, height: 18, cursor: 'pointer', marginTop: 2 }}
                                    />
                                    <label htmlFor="agreeTc" style={{ fontSize: 13, color: 'var(--color-text-dim)', cursor: 'pointer', lineHeight: 1.5 }}>
                                        Tôi cam kết chấp nhận các điều khoản theo <a href="#tc" onClick={e => e.preventDefault()} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Điều khoản & Điều kiện (T&C) của EasyTrade</a>. Mọi hành vi sai trái, đánh cắp tài khoản hay làm lộ thông tin khách hàng đều sẽ phải chịu trách nhiệm trước Pháp Luật.
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className={styles.footer}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.btnBack}`}
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                form="applyMidmanForm"
                                className={`btn-premium ${styles.btnNext}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
