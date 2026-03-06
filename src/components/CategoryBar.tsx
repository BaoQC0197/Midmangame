/**
 * src/components/CategoryBar.tsx
 * 
 * THANH DANH MỤC (Category Filter Bar)
 * -------------------------------------
 * Bím ví file này như "Dãy bảng hiệu" đặt ở đầu cửa hàng. Bro 
 * bấm vào đâu thì hệ thống sẽ tự động lọc và chỉ hiện SP của loại đó.
 */
import type { Category } from '../types/category';
import { FALLBACK_ALL } from '../constants/categories'; // Lấy định nghĩa cho nút "Tất cả"
import styles from './CategoryBar.module.css';

interface CategoryBarProps {
    activeCategory: string; // Key của danh mục đang được chọn
    onFilter: (category: string) => void; // Hàm xử lý khi bro bấm chọn danh mục
    categories: Category[]; // Danh sách các danh mục lấy từ Database
}

export default function CategoryBar({ activeCategory, onFilter, categories }: CategoryBarProps) {
    const allOption = FALLBACK_ALL;
    // Gộp nút "Tất cả" vào đầu danh sách categories
    const fullList = [allOption, ...categories];

    return (
        <div className={styles.categoryBar} id="category-menu">
            <div className={styles.categoryList}>
                {fullList.map((cat) => (
                    <button
                        key={cat.key}
                        /* Nếu đang chọn danh mục này -> Thêm class 'active' để tô màu nổi bật */
                        className={`${styles.categoryPill}${activeCategory === cat.key ? ' ' + styles.active : ''}`}
                        onClick={() => onFilter(cat.key)}
                    >
                        <span className={styles.catIcon}>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
