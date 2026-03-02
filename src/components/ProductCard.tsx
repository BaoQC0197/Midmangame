// src/components/ProductCard.tsx
import type { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function ProductCard({ product, isAdmin, onEdit, onDelete }: ProductCardProps) {
    return (
        <div className="card">
            <img src={product.image} alt={product.name} />
            <div className="card-content">
                <h3>{product.name}</h3>
                <div className="price">{product.price.toLocaleString('vi-VN')} đ</div>
                <p>{product.description}</p>
                {isAdmin && (
                    <div className="admin-actions">
                        <button className="btn-edit" onClick={() => onEdit(product.id)}>Sửa</button>
                        <button className="btn-delete" onClick={() => onDelete(product.id)}>Xoá</button>
                    </div>
                )}
            </div>
        </div>
    );
}
