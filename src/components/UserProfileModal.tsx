import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShieldCheck, Mail, Facebook, Save } from 'lucide-react';
import { getProfile, updateProfileInfo, UserProfile } from '../api/profiles';
import { formatPhone } from '../lib/utils';
import styles from './SellAccountModal.module.css'; // Dùng chung CSS Modal

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
    userId: string;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function UserProfileModal({ open, onClose, userId, showToast }: UserProfileModalProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [cccd, setCccd] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && userId) {
            setLoading(true);
            getProfile(userId).then(data => {
                if (data) {
                    setProfile(data);
                    setCccd(data.cccd || '');
                    setFacebookUrl(data.facebook_url || '');
                }
            }).finally(() => setLoading(false));
        }
    }, [open, userId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfileInfo(userId, {
                cccd,
                facebook_url: facebookUrl
            });
            showToast('Cập nhật hồ sơ thành công!', 'success');
            onClose();
        } catch (error: any) {
            showToast('Lỗi cập nhật: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} style={{ zIndex: 1200 }}>
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
                    className={`${styles.modal} glass-panel`}
                    style={{ maxWidth: 500 }}
                >
                    <div className={styles.header}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className={styles.iconWrapper}>
                                <User size={24} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <h2 className="text-gradient" style={{ margin: 0, fontSize: 22 }}>Hồ sơ cá nhân</h2>
                                <p style={{ fontSize: 13, color: 'var(--color-text-dim)', margin: '4px 0 0 0' }}>
                                    Quản lý thông tin định danh của bạn.
                                </p>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose} disabled={saving}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-dim)' }}>
                                <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
                                Đang tải thông tin...
                            </div>
                        ) : profile ? (
                            <div className={styles.formGroup}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <Mail size={16} style={{ color: 'var(--color-text-dim)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Tài khoản Đăng nhập</div>
                                            <strong style={{ fontSize: 15 }}>{profile.email || userId.slice(0, 8)}</strong>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <ShieldCheck size={16} style={{ color: profile.is_active_midman ? 'var(--color-success)' : 'var(--color-text-dim)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Phân quyền Hệ thống</div>
                                            <strong style={{ fontSize: 14, color: profile.is_active_midman ? 'var(--color-success)' : 'white' }}>
                                                {profile.is_active_midman ? 'Midman Xác Thực (Trusted)' : 'Người dùng Phổ thông'}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                <div className={styles.field} style={{ marginBottom: 16 }}>
                                    <label>Số CCCD / CMND định danh</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Nhập số CCCD thật của bạn"
                                        value={cccd}
                                        onChange={e => setCccd(formatPhone(e.target.value))}
                                        disabled={saving}
                                    />
                                </div>

                                <div className={styles.field} style={{ marginBottom: 24 }}>
                                    <label>Link Facebook Chính chủ</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-dim)' }}>
                                            <Facebook size={18} />
                                        </div>
                                        <input
                                            type="url"
                                            className={styles.input}
                                            style={{ paddingLeft: 42 }}
                                            placeholder="https://facebook.com/..."
                                            value={facebookUrl}
                                            onChange={e => setFacebookUrl(e.target.value)}
                                            disabled={saving}
                                        />
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 8, display: 'inline-block' }}>
                                        Để Admin / Người dùng khác liên hệ xác minh tài khoản khi cần thiết.
                                    </span>
                                </div>

                            </div>
                        ) : (
                            <div style={{ padding: 20, textAlign: 'center', color: '#ef4444' }}>Không tìm thấy dữ liệu.</div>
                        )}
                    </div>

                    {profile && (
                        <div className={styles.footer} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, display: 'flex', gap: 12 }}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={saving}
                                style={{ flex: 1, padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: 12 }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn-premium"
                                onClick={handleSave}
                                disabled={saving}
                                style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'center' }}
                            >
                                {saving ? 'Đang lưu...' : (
                                    <>
                                        <Save size={18} />
                                        Cập nhật
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
