import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { getMidmanProfileAndReviews } from '../api/profiles';
import styles from './MidmanProfileModal.module.css';

interface MidmanProfileModalProps {
    midmanId: string;
    onClose: () => void;
}

export default function MidmanProfileModal({ midmanId, onClose }: MidmanProfileModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (midmanId) {
            getMidmanProfileAndReviews(midmanId).then(data => {
                setProfile(data);
                setLoading(false);
            });
        }
    }, [midmanId]);

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

                    {loading ? (
                        <div style={{ padding: 100, textAlign: 'center' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                            <div style={{ color: 'var(--color-text-dim)' }}>Đang tải hồ sơ trung gian...</div>
                        </div>
                    ) : profile ? (
                        <>
                            <div className={styles.header}>
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {profile.full_name?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                )}
                                <div className={styles.name}>{profile.full_name}</div>
                                <div className={styles.role}>
                                    <ShieldCheck size={14} color="var(--color-success)" />
                                    Trung Gian Xác Thực (EasyTrade)
                                </div>
                                
                                <div className={styles.statsRow}>
                                    <div className={styles.statItem}>
                                        <div className={styles.statValue}>
                                            <Star size={18} color="#f59e0b" fill="#f59e0b" />
                                            {profile.rating}
                                        </div>
                                        <div className={styles.statLabel}>Đánh giá</div>
                                    </div>
                                    <div className={styles.statItem}>
                                        <div className={styles.statValue}>{profile.reviewCount}</div>
                                        <div className={styles.statLabel}>Nhận xét</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.content}>
                                <h3 className={styles.sectionTitle}>
                                    <MessageSquare size={18} className="text-primary" />
                                    Nhận xét từ người dùng
                                </h3>

                                <div className={styles.reviewList}>
                                    {(!profile.reviews || profile.reviews.length === 0) ? (
                                        <div className={styles.emptyState}>
                                            Chưa có đánh giá nào cho Trung gian này.
                                        </div>
                                    ) : (
                                        profile.reviews.map((r: any, idx: number) => (
                                            <div key={idx} className={styles.reviewItem}>
                                                <div className={styles.reviewHeader}>
                                                    <div className={styles.reviewerName}>{r.reviewer_name}</div>
                                                    <div className={styles.reviewDate}>
                                                        {new Date(r.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className={styles.reviewRating}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={12} 
                                                            fill={i < r.rating ? "#f59e0b" : "transparent"} 
                                                            color={i < r.rating ? "#f59e0b" : "rgba(255,255,255,0.2)"} 
                                                        />
                                                    ))}
                                                </div>
                                                <div className={styles.reviewComment}>{r.comment}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: 100, textAlign: 'center', color: 'var(--color-danger)' }}>
                            Không tìm thấy dữ liệu Midman.
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
