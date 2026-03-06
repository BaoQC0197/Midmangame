/**
 * src/components/SkeletonCard.tsx
 * 
 * KHUNG HÌNH CHỜ (Skeleton Loading Card)
 * ---------------------------------------
 * Bím ví file này như một "Hình nhân thế mạng". Khi mạng chậm hoặc 
 * dữ liệu chưa tải xong, những cái khung mờ ảo này sẽ hiện lên để 
 * người dùng không cảm thấy ứng dụng bị "đứng hình".
 */
import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
    return (
        <div className={styles.card}>
            {/* Hiệu ứng 'shimmer' là dải sáng chạy qua chạy lại trên nền xám */}
            <div className={`${styles.shimmer} ${styles.img}`} />
            <div className={styles.body}>
                <div className={`${styles.shimmer} ${styles.title}`} />
                <div className={`${styles.shimmer} ${styles.titleShort}`} />
                <div className={`${styles.shimmer} ${styles.desc}`} />
                <div className={styles.footer}>
                    <div className={`${styles.shimmer} ${styles.price}`} />
                    <div className={`${styles.shimmer} ${styles.btn}`} />
                </div>
            </div>
        </div>
    );
}
