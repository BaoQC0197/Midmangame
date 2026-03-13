import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X, Sparkles, TrendingUp, Clock, Heart } from 'lucide-react';
import styles from './CoffeeDonateModal.module.css';

interface CoffeeDonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CoffeeDonateModal({ isOpen, onClose }: CoffeeDonateModalProps) {
    const benefits = [
        {
            icon: <Sparkles size={20} />,
            title: 'Cờ Hotlist Độc Quyền',
            desc: 'Tài khoản của bạn sẽ hiển thị huy hiệu "Hotlist" cực kỳ nổi bật trên sàn.'
        },
        {
            icon: <TrendingUp size={20} />,
            title: 'Ưu Tiên Hiển Thị',
            desc: 'Đưa tài khoản lên đầu danh sách để thu hút người mua tiềm năng ngay lập tức.'
        },
        {
            icon: <Clock size={20} />,
            title: 'Duy Trì trong 7 Ngày',
            desc: 'Hiệu ứng quảng bá sẽ kéo dài liên tục trong 1 tuần (168 giờ).'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.modalOverlay} onClick={onClose}>
                    <motion.div 
                        className={styles.modalContent}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>

                        <div className={styles.header}>
                            <div className={styles.iconWrapper}>
                                <Coffee size={32} />
                            </div>
                            <h2 className={`${styles.title} text-gradient`}>Mời Cà Phê Admin</h2>
                            <p className={styles.subtitle}>Ủng hộ hệ thống và nâng tầm tài khoản của bạn</p>
                        </div>

                        <div className={styles.benefits}>
                            {benefits.map((benefit, index) => (
                                <motion.div 
                                    key={index} 
                                    className={styles.benefitItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                >
                                    <div className={styles.benefitIcon}>
                                        {benefit.icon}
                                    </div>
                                    <div className={styles.benefitText}>
                                        <h4>{benefit.title}</h4>
                                        <p>{benefit.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <motion.button 
                                className={`btn-premium ${styles.btnDonate}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    window.open('https://me.momo.vn/easytrade', '_blank'); // Ví dụ link
                                }}
                            >
                                <Heart size={18} fill="currentColor" /> Mời cà phê ngay
                            </motion.button>
                            <p className={styles.note}>
                                * Sau khi donate, vui lòng chụp màn hình và gửi cho Admin qua Telegram/Zalo để được kích hoạt Hotlist.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
