// src/components/CartDrawer.tsx
import type { CartItem } from '../hooks/useCart';

interface CartDrawerProps {
    open: boolean;
    items: CartItem[];
    totalPrice: number;
    onClose: () => void;
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
    onCheckout: () => void;
}

export default function CartDrawer({
    open,
    items,
    totalPrice,
    onClose,
    onUpdateQuantity,
    onRemove,
    onCheckout,
}: CartDrawerProps) {
    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay${open ? ' visible' : ''}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside className={`cart-drawer${open ? ' open' : ''}`}>
                <div className="cart-drawer-header">
                    <h2 className="cart-drawer-title">🛒 Giỏ hàng</h2>
                    <button className="cart-close-btn" onClick={onClose} aria-label="Đóng giỏ hàng">✕</button>
                </div>

                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <span className="cart-empty-icon">🛍️</span>
                            <p>Giỏ hàng đang trống</p>
                            <button className="cart-continue-btn" onClick={onClose}>Tiếp tục mua sắm</button>
                        </div>
                    ) : (
                        <ul className="cart-item-list">
                            {items.map(({ product, quantity }) => (
                                <li key={product.id} className="cart-item">
                                    <img src={product.image} alt={product.name} className="cart-item-img" />
                                    <div className="cart-item-info">
                                        <p className="cart-item-name">{product.name}</p>
                                        <p className="cart-item-price">
                                            {(product.price * quantity).toLocaleString('vi-VN')} đ
                                        </p>
                                        <div className="cart-qty-row">
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                                            >−</button>
                                            <span className="cart-qty-num">{quantity}</span>
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                                            >+</button>
                                        </div>
                                    </div>
                                    <button
                                        className="cart-remove-btn"
                                        onClick={() => onRemove(product.id)}
                                        aria-label="Xoá"
                                    >🗑</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-total-row">
                            <span>Tổng cộng</span>
                            <span className="cart-total-price">{totalPrice.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <button className="cart-checkout-btn" onClick={onCheckout}>
                            Đặt hàng ngay →
                        </button>
                        <button className="cart-continue-btn" onClick={onClose}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
