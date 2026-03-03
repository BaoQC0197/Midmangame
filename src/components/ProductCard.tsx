// src/components/ProductCard.tsx
import { useState } from 'react';
import type { Product } from '../types/product';

const CATEGORY_LABELS: Record<string, string> = {
    but: 'Bút viết',
    vo: 'Vở',
    dungcu: 'Dụng cụ HT',
    mythuat: 'Mỹ thuật',
    all: '',
};

interface ProductCardProps {
    product: Product;
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddToCart: (product: Product) => void;
    searchQuery?: string;
}

function Highlight({ text, query }: { text: string; query?: string }) {
    if (!query?.trim()) return <>{text}</>;
    const q = query.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="search-highlight">{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    );
}

export default function ProductCard({ product, isAdmin, onEdit, onDelete, onAddToCart, searchQuery }: ProductCardProps) {
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        onAddToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const catLabel = product.category
        ? (CATEGORY_LABELS[product.category] ?? product.category)
        : '';

    return (
        <div className="card">
            <div className="card-img-wrapper">
                <img src={product.image} alt={product.name} className="card-img" />
                {catLabel && <span className="card-badge">{catLabel}</span>}
            </div>
            <div className="card-content">
                <h3 className="card-name">
                    <Highlight text={product.name} query={searchQuery} />
                </h3>
                {product.description && (
                    <p className="card-desc">{product.description}</p>
                )}
                <div className="card-footer">
                    <div className="card-price">{product.price.toLocaleString('vi-VN')} đ</div>
                    <button
                        className={`btn-add-cart${added ? ' added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={added}
                    >
                        {added ? '✓ Đã thêm' : '+ Giỏ'}
                    </button>
                </div>
                {isAdmin && (
                    <div className="admin-actions">
                        <button className="btn-edit" onClick={() => onEdit(product.id)}>✏️ Sửa</button>
                        <button className="btn-delete" onClick={() => onDelete(product.id)}>🗑 Xoá</button>
                    </div>
                )}
            </div>
        </div>
    );
}
