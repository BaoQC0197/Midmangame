/**
 * src/components/ProductDetailModal.tsx
 * 
 * MODAL CHI TIẾT SẢN PHẨM (Product Detail Modal)
 * -----------------------------------------------
 * Bím ví file này như một cái "Kính lúp". Khi bro bấm vào một sản phẩm, 
 * nó sẽ hiện lên to rõ, cho phép xem nhiều ảnh, đọc mô tả kỹ hơn 
 * và xem cả những món đồ tương tự.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import styles from './ProductDetailModal.module.css';

interface ProductDetailModalProps {
    product: Product;
    allProducts: Product[];
    categories: Category[];
    onClose: () => void;
    onAddToCart: (product: Product, qty: number) => void;
    onBuyNow: (product: Product, qty: number) => void;
    onViewDetail: (product: Product) => void;
}

export default function ProductDetailModal({
    product,
    allProducts,
    categories,
    onClose,
    onAddToCart,
    onBuyNow,
    onViewDetail,
}: ProductDetailModalProps) {
    // TẠO BỘ SƯU TẬP ẢNH: Kết hợp ảnh chính và các ảnh phụ từ Database
    const gallery = (() => {
        let imgs = product.images && product.images.length > 0
            ? product.images
            : [product.image];

        // Loại bỏ các đường dẫn ảnh bị trống hoặc lỗi
        imgs = imgs.filter(img => !!img);

        if (imgs.length === 0) imgs = [DEFAULT_PRODUCT_IMAGE];

        // Lọc bỏ các ảnh trùng lặp để tiết kiệm bộ nhớ
        return [...new Set(imgs)];
    })();

    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({}); // Theo dõi các ảnh bị lỗi để thay bằng ảnh mặc định
    const [activeIdx, setActiveIdx] = useState(0); // Chỉ số của ảnh đang hiển thị
    const [qty, setQty] = useState(1); // Số lượng khách muốn mua
    const [added, setAdded] = useState(false); // Hiệu ứng "Đã thêm" khi bấm nút giỏ hàng

    const categoryLabel = categories.find(c => c.key === product.category);

    // LẤY SẢN PHẨM LIÊN QUAN: Tìm các món cùng danh mục nhưng khác cái đang xem
    const related = allProducts.filter(
        p => p.id !== product.id && p.category === product.category
    ).slice(0, 6);

    // LOGIC ĐÓNG MODAL: Nhấn phím 'ESC' để thoát nhanh
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang phía sau khi đang xem modal
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const handleAddToCart = () => {
        onAddToCart(product, qty);
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 800);
    };

    const handleBuyNow = () => {
        onBuyNow(product, qty);
        onClose();
    };

    const formatPrice = (p: number) =>
        p.toLocaleString('vi-VN') + ' đ';

    const promo = product.promotion;

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                {/* Nút đóng hình chữ X */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>

                <div className={styles.body}>
                    {/* ── BÊN TRÁI: BỘ SƯU TẬP ẢNH ── */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImgWrap}>
                            <img
                                src={imgErrors[gallery[activeIdx]] ? DEFAULT_PRODUCT_IMAGE : gallery[activeIdx]}
                                alt={product.name}
                                className={styles.mainImg}
                                key={activeIdx}
                                onError={() => setImgErrors(prev => ({ ...prev, [gallery[activeIdx]]: true }))}
                            />
                            {/* Nút chuyển ảnh qua lại (nếu có nhiều hơn 1 ảnh) */}
                            {gallery.length > 1 && (
                                <>
                                    <button
                                        className={`${styles.navBtn} ${styles.navPrev}`}
                                        onClick={() => setActiveIdx(i => (i - 1 + gallery.length) % gallery.length)}
                                        disabled={activeIdx === 0}
                                    >‹</button>
                                    <button
                                        className={`${styles.navBtn} ${styles.navNext}`}
                                        onClick={() => setActiveIdx(i => (i + 1) % gallery.length)}
                                        disabled={activeIdx === gallery.length - 1}
                                    >›</button>
                                    <div className={styles.imgCounter}>{activeIdx + 1} / {gallery.length}</div>
                                </>
                            )}
                        </div>

                        {/* Các ảnh nhỏ (Thumbnails) bên dưới ảnh chính */}
                        {gallery.length > 1 && (
                            <div className={styles.thumbStrip}>
                                {gallery.map((url, i) => (
                                    <button
                                        key={url + i}
                                        className={`${styles.thumbBtn}${i === activeIdx ? ' ' + styles.thumbActive : ''}`}
                                        onClick={() => setActiveIdx(i)}
                                    >
                                        <img
                                            src={imgErrors[url] ? DEFAULT_PRODUCT_IMAGE : url}
                                            alt={`Ảnh ${i + 1}`}
                                            onError={() => setImgErrors(prev => ({ ...prev, [url]: true }))}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── BÊN PHẢI: THÔNG TIN SẢN PHẨM ── */}
                    <div className={styles.info}>
                        {categoryLabel && (
                            <span className={styles.categoryBadge}>
                                {categoryLabel.icon} {categoryLabel.label}
                            </span>
                        )}

                        <h2 className={styles.productName}>{product.name}</h2>

                        {/* Hiển thị giá (có tính đến khuyến mãi nếu có) */}
                        {promo ? (
                            <div className={styles.priceBlock}>
                                <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
                                <span className={styles.salePrice}>{formatPrice(promo.sale_price)}</span>
                                <span className={styles.promoLabel}>{promo.label}</span>
                            </div>
                        ) : (
                            <p className={styles.price}>{formatPrice(product.price)}</p>
                        )}

                        {product.description && (
                            <div className={styles.descSection}>
                                <h4 className={styles.descTitle}>Mô tả sản phẩm</h4>
                                <p className={styles.desc}>{product.description}</p>
                            </div>
                        )}

                        {/* Chọn số lượng sản phẩm muốn mua */}
                        <div className={styles.qtySection}>
                            <span className={styles.qtyLabel}>Số lượng</span>
                            <div className={styles.qtyControl}>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    disabled={qty <= 1}
                                >−</button>
                                <span className={styles.qtyValue}>{qty}</span>
                                <button
                                    className={styles.qtyBtn}
                                    onClick={() => setQty(q => q + 1)}
                                >+</button>
                            </div>
                        </div>

                        {/* Nút hành động chính (CTA) */}
                        <div className={styles.ctaRow}>
                            <button
                                className={`${styles.btnCart}${added ? ' ' + styles.btnAdded : ''}`}
                                onClick={handleAddToCart}
                            >
                                {added ? '✅ Đã thêm!' : '🛒 Thêm vào giỏ'}
                            </button>
                            <button className={styles.btnBuyNow} onClick={handleBuyNow}>
                                ⚡ Mua ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── DANH SÁCH SẢN PHẨM LIÊN QUAN ── */}
                {related.length > 0 && (
                    <div className={styles.related}>
                        <h4 className={styles.relatedTitle}>Sản phẩm liên quan</h4>
                        <div className={styles.relatedList}>
                            {related.map(p => (
                                <button
                                    key={p.id}
                                    className={styles.relatedCard}
                                    onClick={() => {
                                        // Khi bấm vào SP liên quan -> Đóng cái cũ, mở cái mới sau một lát
                                        onClose();
                                        setTimeout(() => onViewDetail(p), 50);
                                    }}
                                    title={p.name}
                                >
                                    <img
                                        src={p.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={p.name}
                                        className={styles.relatedImg}
                                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                                    />
                                    <span className={styles.relatedName}>{p.name}</span>
                                    <span className={styles.relatedPrice}>{formatPrice(p.price)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
