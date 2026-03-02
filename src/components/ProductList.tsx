// src/components/ProductList.tsx
import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import ProductCard from './ProductCard';

const PAGE_SIZE_DESKTOP = 16;
const PAGE_SIZE_MOBILE = 8;

function getPageSize() {
    return window.innerWidth <= 768 ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;
}

interface ProductListProps {
    products: Product[];
    isAdmin: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onAddToCart: (product: Product) => void;
    searchQuery?: string;
}

export default function ProductList({ products, isAdmin, onEdit, onDelete, onAddToCart, searchQuery }: ProductListProps) {
    const [visible, setVisible] = useState(() => getPageSize());

    // Reset về trang đầu khi danh sách lọc thay đổi (category / search)
    useEffect(() => {
        setVisible(getPageSize());
    }, [products]);

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

    const shown = products.slice(0, visible);
    const hasMore = visible < products.length;
    const remaining = products.length - visible;

    return (
        <div id="product-list">
            <div className="product-grid">
                {shown.map((product) => (
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

            {/* Load more / summary bar */}
            <div className="product-list-footer">
                <p className="product-count-label">
                    Hiển thị <strong>{shown.length}</strong> / <strong>{products.length}</strong> sản phẩm
                </p>

                {hasMore && (
                    <button
                        className="btn-load-more"
                        onClick={() => setVisible((v) => v + getPageSize())}
                    >
                        Xem thêm {Math.min(remaining, getPageSize())} sản phẩm ↓
                    </button>
                )}

                {/* Nút thu gọn khi đã xem nhiều hơn 1 trang */}
                {visible > getPageSize() && (
                    <button
                        className="btn-collapse"
                        onClick={() => {
                            setVisible(getPageSize());
                            document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Thu gọn ↑
                    </button>
                )}
            </div>
        </div>
    );
}
