/**
 * src/hooks/useCart.ts
 * 
 * QUẢN LÝ GIỎ HÀNG (Shopping Cart Logic)
 * --------------------------------------
 * Bím xây dựng hook này để trang web có thể "nhớ" những món hàng 
 * mà bro đã chọn, kể cả khi bro tắt trình duyệt và mở lại.
 */
import { useState, useCallback, useEffect } from 'react';
import type { Product } from '../types/product';

// Định nghĩa một món hàng trong giỏ: gồm sản phẩm và số lượng
export interface CartItem {
    product: Product;
    quantity: number;
}

// Tên định danh để lưu vào bộ nhớ trình duyệt (localStorage)
const STORAGE_KEY = 'vpp_cart';

// Hàm lấy dữ liệu giỏ hàng cũ đã lưu trong máy (nếu có)
function loadFromStorage(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // Nếu có thì chuyển từ dạng chữ (JSON string) sang mảng (Array)
        return raw ? JSON.parse(raw) : [];
    } catch {
        // Nếu có lỗi (do dữ liệu hỏng), trả về giỏ hàng trống
        return [];
    }
}

export function useCart() {
    // Trạng thái của giỏ hàng (khởi tạo bằng dữ liệu lấy từ máy người dùng)
    const [items, setItems] = useState<CartItem[]>(loadFromStorage);

    // MỖI KHI GIỎ HÀNG THAY ĐỔI -> Tự động lưu lại vào máy người dùng
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // HÀM: THÊM VÀO GIỎ
    const addToCart = useCallback((product: Product) => {
        setItems((prev) => {
            // Kiểm tra xem sản phẩm này đã có trong giỏ chưa
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                // Nếu có rồi thì chỉ tăng số lượng lên 1
                return prev.map((i) =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            // Nếu chưa có thì thêm mới vào mảng với số lượng là 1
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    // HÀM: XÓA KHỎI GIỎ
    const removeFromCart = useCallback((productId: number) => {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    // HÀM: TĂNG/GIẢM SỐ LƯỢNG
    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            // Nếu số lượng về 0 hoặc nhỏ hơn -> Xóa luôn khỏi giỏ
            setItems((prev) => prev.filter((i) => i.product.id !== productId));
        } else {
            // Ngược lại thì cập nhật số lượng mới
            setItems((prev) =>
                prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
            );
        }
    }, []);

    // HÀM: XÓA SẠCH GIỎ (Sau khi đặt hàng thành công)
    const clearCart = useCallback(() => setItems([]), []);

    // CÁC BIẾN TÍNH TOÁN NHANH (Dùng để hiển thị ở Header/CartDrawer)
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0); // Tổng số món hàng
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0); // Tổng số tiền

    // Trả về tất cả các hàm và dữ liệu để UI dùng
    return { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice };
}
