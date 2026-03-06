/**
 * src/components/Toast.tsx
 * 
 * THÔNG BÁO NHANH (Snackbar/Toast Notification)
 * -----------------------------------------------
 * Bím ví file này như những "Mẩu giấy ghi chú" hiện ra trong chốc lát. 
 * Nó giúp báo cho khách biết là "Đã thêm vào giỏ" hoặc "Lỗi rồi" 
 * một cách nhẹ nhàng mà không làm gián đoạn việc mua sắm.
 */
import { useEffect } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string; // Nội dung thông báo
    type?: ToastType; // Loại thông báo (Thành công, Lỗi, Thông tin)
    onClose: () => void; // Hàm để tự đóng thông báo
    duration?: number; // Thời gian hiển thị (mặc định là 3 giây)
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    // Tự động đóng thông báo sau một khoảng thời gian
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer); // Xóa bộ hẹn giờ nếu component bị hủy
    }, [onClose, duration]);

    // Các biểu tượng tương ứng với từng loại thông báo
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        /* Bấm trực tiếp vào thông báo cũng sẽ tắt nó */
        <div className={`${styles.toast} ${styles[type]}`} onClick={onClose}>
            <span className={styles.icon}>{icons[type]}</span>
            <span className={styles.message}>{message}</span>
        </div>
    );
}
