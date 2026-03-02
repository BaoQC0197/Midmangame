// src/hooks/useCart.ts
import { useState, useCallback, useEffect } from 'react';
import type { Product } from '../types/product';

export interface CartItem {
    product: Product;
    quantity: number;
}

const STORAGE_KEY = 'vpp_cart';

function loadFromStorage(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(loadFromStorage);

    // Persist to localStorage on every change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((product: Product) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.product.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.product.id !== productId));
        } else {
            setItems((prev) =>
                prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
            );
        }
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    return { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice };
}
