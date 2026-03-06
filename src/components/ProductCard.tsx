/**
 * src/components/ProductCard.tsx
 * 
 * THẺ SẢN PHẨM (Product Card)
 * ----------------------------
 * Bím ví file này như một cái "Kệ trưng bày nhỏ" cho từng món hàng. 
 * Nó giúp khách thấy ảnh, giá, và bấm nút "Mua ngay".
 */
import { useState } from 'react';
import type { Product } from '../types/product';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddToCart: (product: Product) => void;
    onViewDetail?: (product: Product) => void;
    searchQuery?: string; // Từ khóa tìm kiếm để bôi đậm kết quả
}

// HÀM TIỆN ÍCH: Bôi đậm từ khóa khi bro tìm kiếm sản phẩm
function Highlight({ text, query }: { text: string; query?: string }) {
    if (!query?.trim()) return <>{text}</>;
    const q = query.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className={styles.searchHighlight}>{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    );
}

export default function ProductCard({ product, isAdmin, onEdit, onDelete, onAddToCart, onViewDetail, searchQuery }: ProductCardProps) {
    const [added, setAdded] = useState(false); // Hiệu ứng "Đã thêm" sau khi bấm nút mua
    const [imgError, setImgError] = useState(false); // Theo dõi xem ảnh sản phẩm có bị lỗi không
    const promo = product.promotion; // Lấy thông tin khuyến mãi (nếu có)

    // Hành động khi bấm nút thêm vào giỏ
    const handleAddToCart = () => {
        onAddToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500); // Sau 1.5 giây hiện lại chữ bình thường
    };

    // Hàm định dạng tiền tệ (Ví dụ: 10000 -> 10.000 đ)
    const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

    // Xử lý ảnh: Nếu không có ảnh hoặc ảnh lỗi -> dùng ảnh mặc định của Bím
    const imgSrc = (!product.image || imgError) ? DEFAULT_PRODUCT_IMAGE : product.image;

    return (
        <div className={styles.card}>
            {/* PHẦN TRÊN: Hình ảnh sản phẩm */}
            <div
                className={styles.cardImgWrapper}
                onClick={() => onViewDetail?.(product)}
                title="Xem chi tiết"
            >
                <img
                    src={imgSrc}
                    alt={product.name}
                    className={styles.cardImg}
                    onError={() => setImgError(true)}
                />
                <div className={styles.imgOverlay}>
                    <span className={styles.imgZoomIcon}>🔍</span>
                </div>
                {/* Hiện nhãn SALE nếu có */}
                {promo && (
                    <span className={styles.saleBadge}>{promo.label}</span>
                )}
            </div>

            {/* PHẦN DƯỚI: Nội dung (Tên, Giá, Nút bấm) */}
            <div className={styles.cardContent}>
                {/* Tên sản phẩm */}
                <h3
                    className={styles.cardName}
                    onClick={() => onViewDetail?.(product)}
                    style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
                >
                    <Highlight text={product.name} query={searchQuery} />
                </h3>

                {/* Mô tả ngắn */}
                {product.description && (
                    <p className={styles.cardDesc}>{product.description}</p>
                )}

                <div className={styles.cardFooter}>
                    {/* Khu vực hiển thị giá */}
                    <div className={styles.priceBlock}>
                        {promo ? (
                            <>
                                {/* Hiện giá cũ (gạch ngang) và giá khuyến mãi mới */}
                                <span className={styles.originalPrice}>{fmt(product.price)}</span>
                                <span className={styles.salePrice}>{fmt(promo.sale_price)}</span>
                            </>
                        ) : (
                            <span className={styles.cardPrice}>{fmt(product.price)}</span>
                        )}
                    </div>

                    {/* Nút thêm vào giỏ (ẩn nếu là Admin) */}
                    {!isAdmin && (
                        <button
                            className={`${styles.btnAddCart}${added ? ' ' + styles.added : ''}`}
                            onClick={handleAddToCart}
                            disabled={added}
                        >
                            {added ? '✓ Đã thêm' : '+ Giỏ'}
                        </button>
                    )}
                </div>

                {/* Các nút Sửa/Xóa dành riêng cho Admin */}
                {isAdmin && (
                    <div className={styles.adminActions}>
                        <button className={styles.btnEdit} onClick={() => onEdit(product.id)}>✏️ Sửa</button>
                        <button className={styles.btnDelete} onClick={() => onDelete(product.id)}>🗑 Xoá</button>
                    </div>
                )}
            </div>
        </div>
    );
}
