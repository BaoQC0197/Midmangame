/**
 * src/components/CartDrawer.tsx
 * 
 * GIỎ HÀNG TRƯỢT (Cart Slide-out Drawer)
 * --------------------------------------
 * Bím ví file này như một cái "Giỏ xách ảo". Nó hiện ra từ bên phải 
 * màn hình để bro kiểm tra lại những thứ mình đã chọn trước khi thanh toán.
 */
import { useState, useEffect } from 'react';
import type { CartItem } from '../hooks/useCart';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
    open: boolean; // Trạng thái đóng/mở giỏ hàng
    items: CartItem[]; // Danh sách các món hàng
    totalPrice: number; // Tổng số tiền
    onClose: () => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
    onCheckout: () => void; // Chuyển sang bước điền thông tin đặt hàng
    onClearCart: () => void; // Xóa sạch giỏ hàng
}

export default function CartDrawer({ open, items, totalPrice, onClose, onUpdateQuantity, onRemove, onCheckout, onClearCart }: CartDrawerProps) {
    const [confirmClear, setConfirmClear] = useState(false); // Trạng thái xác nhận trước khi xóa sạch giỏ

    // NGĂN SCROLL NỀN: Vô hiệu hóa cuộn trang khi Giỏ hàng đang mở
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Hàm xử lý xóa sạch giỏ (bấm 2 lần mới xóa để tránh lỡ tay)
    const handleClearCart = () => {
        if (confirmClear) {
            onClearCart();
            setConfirmClear(false);
        } else {
            setConfirmClear(true);
            setTimeout(() => setConfirmClear(false), 3000); // Sau 3 giây tự tắt cảnh báo
        }
    };

    return (
        <>
            {/* Lớp nền mờ phía sau, bấm vào đây sẽ đóng giỏ hàng */}
            <div className={`${styles.cartOverlay}${open ? ' ' + styles.visible : ''}`} onClick={onClose} />

            {/* Khung giỏ hàng trượt */}
            <aside className={`${styles.cartDrawer}${open ? ' ' + styles.open : ''}`}>
                <div className={styles.cartDrawerHeader}>
                    <h2 className={styles.cartDrawerTitle}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.titleIcon}>
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Giỏ hàng của bạn
                    </h2>
                    <div className={styles.cartHeaderActions}>
                        {items.length > 0 && (
                            <button
                                className={`${styles.clearCartBtn}${confirmClear ? ' ' + styles.confirmClear : ''}`}
                                onClick={handleClearCart}
                                title="Xoá hết giỏ hàng"
                            >
                                {confirmClear ? '⚠️ Xác nhận xoá hết?' : '🗑 Xoá hết'}
                            </button>
                        )}
                        <button className={styles.cartCloseBtn} onClick={onClose} aria-label="Đóng giỏ hàng">✕</button>
                    </div>
                </div>

                <div className={styles.cartDrawerBody}>
                    {items.length === 0 ? (
                        /* Giao diện khi giỏ trống */
                        <div className={styles.cartEmpty}>
                            <div className={styles.cartEmptyIconWrapper}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.cartEmptyIconSvg}>
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    <line x1="8" y1="11" x2="16" y2="11" strokeDasharray="2 2" opacity="0.5" />
                                </svg>
                            </div>
                            <p>Chưa có món đồ nào trong giỏ :(</p>
                            <button className={styles.cartContinueBtn} onClick={onClose}>Tiếp tục mua sắm ngay</button>
                        </div>
                    ) : (
                        /* Danh sách các món hàng trong giỏ */
                        <ul className={styles.cartItemList}>
                            {items.map(({ product, quantity }) => (
                                <li key={product.id} className={styles.cartItem}>
                                    <img
                                        src={product.image || DEFAULT_PRODUCT_IMAGE}
                                        alt={product.name}
                                        className={styles.cartItemImg}
                                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                                    />
                                    <div className={styles.cartItemInfo}>
                                        <p className={styles.cartItemName}>{product.name}</p>
                                        <p className={styles.cartItemPrice}>{(product.price * quantity).toLocaleString('vi-VN')} đ</p>
                                        {/* Nút tăng/giảm số lượng */}
                                        <div className={styles.cartQtyRow}>
                                            <button className={styles.cartQtyBtn} onClick={() => onUpdateQuantity(product.id, quantity - 1)}>−</button>
                                            <span className={styles.cartQtyNum}>{quantity}</span>
                                            <button className={styles.cartQtyBtn} onClick={() => onUpdateQuantity(product.id, quantity + 1)}>+</button>
                                        </div>
                                    </div>
                                    {/* Nút xóa món này khỏi giỏ */}
                                    <button className={styles.cartRemoveBtn} onClick={() => onRemove(product.id)} aria-label="Xoá">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* PHẦN CHÂN GIỎ HÀNG: Tổng tiền và nút Than toán */}
                {items.length > 0 && (
                    <div className={styles.cartDrawerFooter}>
                        <div className={styles.cartTotalRow}>
                            <span>Tổng cộng</span>
                            <span className={styles.cartTotalPrice}>{totalPrice.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <button className={styles.cartCheckoutBtn} onClick={onCheckout}>Đặt hàng ngay →</button>
                        <button className={styles.cartContinueBtn} onClick={onClose}>Tiếp tục mua sắm</button>
                    </div>
                )}
            </aside>
        </>
    );
}
