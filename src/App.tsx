// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase, ADMIN_EMAIL } from './lib/supabase';
import { getProducts, addProduct, deleteProduct, updateProduct, getProductById } from './api/products';
import type { Product, ProductInput } from './types/product';

import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import AdminPanel from './components/AdminPanel';
import EditModal from './components/EditModal';
import FloatButtons from './components/FloatButtons';

export default function App() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Load danh sách sản phẩm
    const loadProducts = useCallback(async () => {
        const data = await getProducts();
        setProducts(data);
    }, []);

    // Kiểm tra phiên đăng nhập khi khởi động
    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (user && user.email === ADMIN_EMAIL) {
                setIsAdmin(true);
            }
            loadProducts();
        };
        checkUser();
    }, [loadProducts]);

    // ===== AUTH =====
    const handleLogin = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Sai email hoặc mật khẩu');
            return;
        }
        if (data.user?.email === ADMIN_EMAIL) {
            setIsAdmin(true);
        }
        await loadProducts();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
        await loadProducts();
    };

    // ===== CRUD =====
    const handleAdd = async (product: ProductInput) => {
        await addProduct(product);
        await loadProducts();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xoá sản phẩm này?')) return;
        await deleteProduct(id);
        await loadProducts();
    };

    const handleEdit = async (id: number) => {
        const product = await getProductById(id);
        if (!product) {
            alert('Không lấy được dữ liệu sản phẩm');
            return;
        }
        setEditingProduct(product);
    };

    const handleUpdate = async (id: number, data: Partial<Product>) => {
        await updateProduct(id, data);
        await loadProducts();
    };

    // ===== FILTER =====
    const filteredProducts =
        activeCategory === 'all'
            ? products
            : products.filter((p) => p.category === activeCategory);

    return (
        <>
            <Header isAdmin={isAdmin} onLogin={handleLogin} onLogout={handleLogout} />
            <CategoryBar activeCategory={activeCategory} onFilter={setActiveCategory} />
            <Hero />

            <main className="container">
                <ProductList
                    products={filteredProducts}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </main>

            {isAdmin && <AdminPanel onAdd={handleAdd} />}

            {editingProduct && (
                <EditModal
                    product={editingProduct}
                    onSave={handleUpdate}
                    onClose={() => setEditingProduct(null)}
                />
            )}

            <FloatButtons />

            <footer>
                © 2026 VPP Ti Anh - Hotline: 0987063387
            </footer>
        </>
    );
}
