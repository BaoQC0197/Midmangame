// src/components/ProductList.tsx
import type { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductListProps {
    products: Product[];
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddToCart: (product: Product) => void;
    searchQuery?: string;
}

export default function ProductList({ products, isAdmin, onEdit, onDelete, onAddToCart, searchQuery }: ProductListProps) {
    if (products.length === 0) {
        return (
            <div id="product-list" className="empty-state">
                <span className="empty-icon">🔍</span>
                {searchQuery?.trim() ? (
                    <p>Không tìm thấy sản phẩm nào với từ khoá "<strong>{searchQuery}</strong>".</p>
                ) : (
                    <p>Không có sản phẩm nào trong danh mục này.</p>
                )}
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
                    onAddToCart={onAddToCart}
                    searchQuery={searchQuery}
                />
            ))}
        </div>
    );
}
