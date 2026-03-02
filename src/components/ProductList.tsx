// src/components/ProductList.tsx
import type { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductListProps {
    products: Product[];
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function ProductList({ products, isAdmin, onEdit, onDelete }: ProductListProps) {
    if (products.length === 0) {
        return (
            <div id="product-list" className="product-grid" style={{ textAlign: 'center', color: 'white', padding: '40px 0' }}>
                <p>Không có sản phẩm nào.</p>
            </div>
        );
    }

    return (
        <div id="product-list" className="product-grid">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
