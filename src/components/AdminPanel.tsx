// src/components/AdminPanel.tsx
import { useState } from 'react';
import type { ProductInput } from '../types/product';
import ImageUpload from './ImageUpload';

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

interface FormErrors {
    name?: string;
    price?: string;
    image?: string;
}

export default function AdminPanel({ onAdd }: AdminPanelProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showSuccess, setShowSuccess] = useState(false);
    // key để force remount ImageUpload → reset ảnh
    const [imageKey, setImageKey] = useState(0);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!name.trim()) newErrors.name = 'Vui lòng nhập tên sản phẩm';
        if (!price) {
            newErrors.price = 'Vui lòng nhập giá';
        } else if (isNaN(parseInt(price)) || parseInt(price) <= 0) {
            newErrors.price = 'Giá không hợp lệ';
        }
        if (!image) newErrors.image = 'Vui lòng upload ảnh sản phẩm';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setImage('');
        setDescription('');
        setCategory('all');
        setErrors({});
        setImageKey((k) => k + 1); // remount ImageUpload → clear ảnh
    };

    const handleAdd = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onAdd({ name: name.trim(), price: parseInt(price), image, description, category });
            resetForm();
            setShowSuccess(true);
        } catch {
            setErrors((prev) => ({ ...prev, name: 'Lỗi khi thêm sản phẩm, thử lại nhé!' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ===== Success Popup ===== */}
            {showSuccess && (
                <div className="popup-overlay" onClick={() => setShowSuccess(false)}>
                    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-icon">✅</div>
                        <h3 className="popup-title">Thêm thành công!</h3>
                        <p className="popup-msg">Sản phẩm đã được thêm vào danh sách.</p>
                        <button className="popup-btn" onClick={() => setShowSuccess(false)}>
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Form ===== */}
            <div id="admin-panel" className="admin-panel">
                <h2>BỔ SUNG SẢN PHẨM</h2>

                {/* Tên sản phẩm */}
                <input
                    id="name"
                    placeholder="Tên sản phẩm *"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                    className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}

                {/* Giá */}
                <input
                    id="price"
                    placeholder="Giá (VNĐ) *"
                    type="number"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: undefined })); }}
                    className={errors.price ? 'input-error' : ''}
                />
                {errors.price && <p className="field-error">{errors.price}</p>}

                {/* Ảnh sản phẩm */}
                <label className="field-label">Ảnh sản phẩm *</label>
                <ImageUpload
                    key={imageKey}
                    onUploaded={(url) => { setImage(url); setErrors((p) => ({ ...p, image: undefined })); }}
                />
                {errors.image && <p className="field-error">{errors.image}</p>}

                {/* Mô tả (optional) */}
                <textarea
                    id="desc"
                    placeholder="Mô tả (không bắt buộc)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Danh mục */}
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                </select>

                <div className="btn-wrapper">
                    <button onClick={handleAdd} className="btn-add" disabled={loading}>
                        {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                    </button>
                </div>
            </div>
        </>
    );
}
