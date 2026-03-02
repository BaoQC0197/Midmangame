// src/components/AdminPanel.tsx
import { useState } from 'react';
import type { ProductInput } from '../types/product';

interface AdminPanelProps {
    onAdd: (product: ProductInput) => Promise<void>;
}

const CATEGORIES = [
    { key: 'all', label: 'Tất cả' },
    { key: 'but', label: 'Bút viết' },
    { key: 'vo', label: 'Vở' },
    { key: 'dungcu', label: 'Dụng cụ học tập' },
    { key: 'mythuat', label: 'Mỹ thuật' },
];

export default function AdminPanel({ onAdd }: AdminPanelProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!name || !price) {
            alert('Vui lòng nhập tên và giá sản phẩm');
            return;
        }
        const parsedPrice = parseInt(price);
        if (isNaN(parsedPrice)) {
            alert('Giá không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await onAdd({ name, price: parsedPrice, image, description, category });
            setName('');
            setPrice('');
            setImage('');
            setDescription('');
            setCategory('all');
        } catch {
            alert('Lỗi khi thêm sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="admin-panel" className="admin-panel">
            <h2>BỔ SUNG SẢN PHẨM</h2>
            <input
                id="name"
                placeholder="Tên sản phẩm"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                id="price"
                placeholder="Giá"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <input
                id="image"
                placeholder="Link ảnh"
                value={image}
                onChange={(e) => setImage(e.target.value)}
            />
            <textarea
                id="desc"
                placeholder="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #b2dfdb' }}
            >
                {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                ))}
            </select>
            <div className="btn-wrapper">
                <button onClick={handleAdd} className="btn-add" disabled={loading}>
                    {loading ? 'Đang thêm...' : 'Thêm'}
                </button>
            </div>
        </div>
    );
}
