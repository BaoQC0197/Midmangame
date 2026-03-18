import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Gamepad2,
    ShieldCheck,
    Image as ImageIcon,
    Tag,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Upload
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_STRUCTURE, CategoryKey } from '../types/account';
import styles from './SellAccountModal.module.css';

interface SellAccountModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    currentUserPhone?: string | null;
    isLoggedIn?: boolean;
}

const STEPS = [
    { title: 'Danh mục', icon: Gamepad2 },
    { title: 'Thông Tin', icon: ShieldCheck },
    { title: 'Hình Ảnh', icon: ImageIcon },
    { title: 'Giá Bán', icon: Tag },
];

const ACCOUNT_TYPES = ['Tài khoản Starter', 'Tài khoản Nâng cao', 'Tài khoản VIP (Whale)', 'Tài khoản MXH/Dịch vụ'];
const BIND_STATUSES = ['Trắng thông tin (Chưa liên kết)', 'Có thể gỡ bind (Pending Unbind)', 'Liên kết Email chết', 'Bàn giao đầy đủ Email', 'Khác'];

export default function SellAccountModal({ open, onClose, onSubmit, isSubmitting, currentUserPhone, isLoggedIn }: SellAccountModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        phone: currentUserPhone || '',
        game: '' as CategoryKey | '',
        server: 'Asia',
        accountType: ACCOUNT_TYPES[0],
        bindStatus: BIND_STATUSES[0],
        images: [] as File[],
        price: '',
        description: '',
        title: '',
        password: '',
        confirmPassword: '',
        feePayer: 'seller' as 'seller' | 'buyer' | 'split'
    });

    useEffect(() => {
        if (open) {
            setCurrentStep(0);
            setFormData({
                phone: currentUserPhone || '',
                game: '' as CategoryKey | '',
                server: 'Asia',
                accountType: ACCOUNT_TYPES[0],
                bindStatus: BIND_STATUSES[0],
                images: [] as File[],
                price: '',
                description: '',
                title: '',
                password: '',
                confirmPassword: '',
                feePayer: 'seller' as 'seller' | 'buyer' | 'split'
            });
        }
    }, [open, currentUserPhone]);

    if (!open) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onSubmit(formData);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData(prev => {
                const totalFiles = [...prev.images, ...newFiles];
                if (totalFiles.length > 10) {
                    alert('Chỉ được tải lên tối đa 10 hình ảnh.');
                    return { ...prev, images: totalFiles.slice(0, 10) };
                }
                return { ...prev, images: totalFiles };
            });
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
    };

    const canProceed = () => {
        if (currentStep === 0) return !!formData.game;
        if (currentStep === 1) {
            const isPhoneValid = !!formData.phone && formData.phone.length >= 9;
            const isPasswordValid = isLoggedIn || (formData.password?.length >= 6 && formData.password === formData.confirmPassword);
            return !!formData.server && isPhoneValid && isPasswordValid;
        }
        if (currentStep === 2) return formData.images.length > 0;
        if (currentStep === 3) return !!formData.price && !!formData.title;
        return true;
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={onClose} />
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
                <div className={styles.header}>
                    <div>
                        <h2>Ký Gửi Tài Khoản</h2>
                        <p>Tạo ticket bán tài khoản trung gian an toàn</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.progressContainer}>
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div key={step.title} className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                                <div className={styles.stepIcon}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                                <span>{step.title}</span>
                                {index < STEPS.length - 1 && <div className={styles.stepLine} />}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.content}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.stepContent}
                        >
                            {/* STEP 1: CHỌN DANH MỤC */}
                            {currentStep === 0 && (
                                <div className={styles.hierarchicalSelection}>
                                    {CATEGORY_STRUCTURE.map(group => (
                                        <div key={group.id} className={styles.categoryGroup}>
                                            <h3 className={styles.groupTitle}>{group.label}</h3>
                                            <div className={styles.gridSelection}>
                                                {group.items.map(key => (
                                                    <div
                                                        key={key}
                                                        className={`${styles.selectionCard} ${formData.game === key ? styles.selected : ''}`}
                                                        onClick={() => setFormData({ ...formData, game: key as CategoryKey })}
                                                    >
                                                        <div className={styles.radioCircle}>
                                                            {formData.game === key && <div className={styles.radioInner} />}
                                                        </div>
                                                        <Gamepad2 size={24} className={styles.cardIcon} />
                                                        <span>{CATEGORY_LABELS[key]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* STEP 2: THÔNG TIN ACCOUNT */}
                            {currentStep === 1 && (
                                <div className={styles.formGroup}>
                                    <div className={styles.field}>
                                        <label>Số điện thoại liên hệ (Zalo/Gọi)</label>
                                        <input
                                            type="tel"
                                            className={styles.input}
                                            placeholder="0912345678"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={isLoggedIn}
                                            autoComplete="off"
                                        />
                                        {isLoggedIn && (
                                            <span className={styles.hintText}>Đang sử dụng số điện thoại gắn với tài khoản của bạn.</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Phân loại tài khoản</label>
                                        <select
                                            className={styles.input}
                                            value={formData.accountType}
                                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                        >
                                            {ACCOUNT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Server</label>
                                        <select
                                            className={styles.input}
                                            value={formData.server}
                                            onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                                        >
                                            <option value="Asia">Asia</option>
                                            <option value="America">America</option>
                                            <option value="Europe">Europe</option>
                                            <option value="TW, HK, MO">TW, HK, MO</option>
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Trạng thái liên kết (Bind)</label>
                                        <select
                                            className={styles.input}
                                            value={formData.bindStatus}
                                            onChange={(e) => setFormData({ ...formData, bindStatus: e.target.value })}
                                        >
                                            {BIND_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                                        </select>
                                        <span className={styles.hintText}>* Thông tin này giúp người mua đánh giá độ an toàn của tài khoản.</span>
                                    </div>
                                    {!isLoggedIn && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div className={styles.field}>
                                                <label>Mật khẩu tạo mới <span>(tối thiểu 6 ký tự)</span></label>
                                                <input
                                                    type="password"
                                                    className={styles.input}
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <span className={styles.hintText}>Dùng để đăng nhập quản lý.</span>
                                            </div>
                                            <div className={styles.field}>
                                                <label>Xác nhận mật khẩu</label>
                                                <input
                                                    type="password"
                                                    className={styles.input}
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: HÌNH ẢNH */}
                            {currentStep === 2 && (
                                <div className={styles.formGroup}>
                                    <div className={styles.field}>
                                        <label>Tải lên Hình ảnh (Kéo thả hoặc Bấm chọn - Tối đa 10 hình)</label>
                                        <div className={styles.uploadArea}>
                                            <input
                                                type="file"
                                                id="file-upload"
                                                accept="image/*"
                                                multiple
                                                className={styles.fileInput}
                                                onChange={handleImageUpload}
                                                disabled={formData.images.length >= 10}
                                            />
                                            <label htmlFor="file-upload" className={`${styles.uploadLabel} ${formData.images.length >= 10 ? styles.disabled : ''}`}>
                                                <Upload size={32} />
                                                <span>Nhấn hoặc kéo thả ảnh vào đây</span>
                                                <small>Hỗ trợ JPG, PNG, WEBP (Dưới 5MB, Max: 10 file)</small>
                                            </label>
                                        </div>
                                    </div>
                                    {formData.images.length > 0 && (
                                        <div className={styles.imageGrid}>
                                            {formData.images.map((file, idx) => (
                                                <div key={idx} className={styles.imagePreview}>
                                                    <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} />
                                                    {idx === 0 && <span className={styles.thumbnailBadge}>Ảnh bìa</span>}
                                                    <button
                                                        type="button"
                                                        className={styles.removeImageBtn}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeImage(idx);
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: GIÁ BÁN & TIÊU ĐỀ */}
                            {currentStep === 3 && (
                                <div className={styles.formGroup}>
                                    <div className={styles.field}>
                                        <label>Tiêu đề bài đăng</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="VD: [ASIA] AR60 Full 5 sao trấn..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Giá mong muốn nhận (VNĐ)</label>
                                        <input
                                            type="number"
                                            className={`${styles.input} ${styles.priceInput}`}
                                            placeholder="500000"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                        <span className={styles.hintText}>Phí trung gian 5% sẽ được tính sát giá lúc giao dịch thanh toán.</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Ghi chú thêm cho người mua (Không bắt buộc)</label>
                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Ví dụ: Lịch sử nạp đầy đủ, bao back..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* PHẦN TÍNH PHÍ TRUNG GIAN */}
                                    <div className={styles.feeSection}>
                                        <div className={styles.field}>
                                            <label>Ai sẽ là người chịu phí trung gian?</label>
                                            <div className={styles.feeOptions}>
                                                {[
                                                    { id: 'seller', label: 'Tôi (Người bán) chịu' },
                                                    { id: 'buyer', label: 'Người mua chịu' },
                                                    { id: 'split', label: 'Chia đôi (50/50)' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        className={`${styles.feeOptionBtn} ${formData.feePayer === opt.id ? styles.active : ''}`}
                                                        onClick={() => setFormData({ ...formData, feePayer: opt.id as any })}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.price && parseFloat(formData.price) > 0 && (
                                            <div className={styles.feeCalculation}>
                                                <div className={styles.calcRow}>
                                                    <span>Tổng phí trung gian:</span>
                                                    <span>{new Intl.NumberFormat('vi-VN').format(Math.max(parseFloat(formData.price) * 0.05, 30000))}đ</span>
                                                </div>
                                                <div className={`${styles.calcRow} ${styles.totalRow}`}>
                                                    <span>Bạn thực nhận:</span>
                                                    <span className={styles.receiveAmount}>
                                                        {new Intl.NumberFormat('vi-VN').format(
                                                            formData.feePayer === 'seller' ? 
                                                                parseFloat(formData.price) - Math.max(parseFloat(formData.price) * 0.05, 30000) :
                                                            formData.feePayer === 'split' ?
                                                                parseFloat(formData.price) - (Math.max(parseFloat(formData.price) * 0.05, 30000) / 2) :
                                                                parseFloat(formData.price)
                                                        )}đ
                                                    </span>
                                                </div>
                                                <p className={styles.feeDisclaimer}>
                                                    * Phí 5% (tối thiểu 30.000đ). Phí sẽ được Admin trừ trực tiếp lúc giải ngân tiền cho bạn.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className={styles.footer}>
                    <button
                        className={`${styles.btn} ${styles.btnBack} ${currentStep === 0 ? styles.hidden : ''}`}
                        onClick={handleBack}
                    >
                        <ChevronLeft size={20} /> Quay lại
                    </button>

                    <button
                        className={`btn-premium ${styles.btnNext}`}
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                    >
                        {isSubmitting ? 'Đang tải lên...' : (currentStep === STEPS.length - 1 ? 'Xác nhận tạo Ticket' : 'Tiếp tục')}
                        {currentStep < STEPS.length - 1 && <ChevronRight size={20} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
