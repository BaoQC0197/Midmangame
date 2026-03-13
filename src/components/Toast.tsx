import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    show: boolean;
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ show, message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 size={18} />;
            case 'error': return <AlertCircle size={18} />;
            case 'info': return <Info size={18} />;
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <div className={styles.toastContainer}>
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`${styles.toast} ${styles[type]}`}
                    >
                        <div className={styles.icon}>{getIcon()}</div>
                        <span className={styles.message}>{message}</span>
                        <button className={styles.close} onClick={onClose}>
                            <X size={16} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
