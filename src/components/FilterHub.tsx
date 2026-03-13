import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ChevronDown, Search, X, Banknote, ChevronRight } from 'lucide-react';
import styles from './FilterHub.module.css';
import { CATEGORY_LABELS, CATEGORY_STRUCTURE, CategoryKey } from '../types/account';

interface FilterHubProps {
    selectedGame: string;
    onSelectedGameChange: (val: string) => void;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    sortBy: string;
    onSortChange: (val: string) => void;
    feePayer: string;
    onFeePayerChange: (val: string) => void;
    accType: string;
    onAccTypeChange: (val: string) => void;
    minPrice: string;
    onMinPriceChange: (val: string) => void;
    maxPrice: string;
    onMaxPriceChange: (val: string) => void;
}

export default function FilterHub({
    selectedGame, onSelectedGameChange,
    searchQuery, onSearchChange,
    sortBy, onSortChange,
    feePayer, onFeePayerChange,
    accType, onAccTypeChange,
    minPrice, onMinPriceChange,
    maxPrice, onMaxPriceChange
}: FilterHubProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const feeOptions = [
        { label: 'Tất cả', value: 'All' },
        { label: 'Bên bán trả', value: 'seller' },
        { label: 'Bên mua trả', value: 'buyer' },
        { label: 'Chia đôi', value: 'split' },
    ];

    const typeOptions = [
        { label: 'Tất cả', value: 'All' },
        { label: 'Trắng thông tin', value: 'Trắng' },
        { label: 'Giao Email', value: 'Email' },
    ];


    // Clicks outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGroupClick = (groupId: string) => {
        if (groupId === 'All') {
            onSelectedGameChange('All');
            onSearchChange('');
            setMenuOpen(false);
        } else {
            // If Level 1 is clicked, we filter by that group (this needs support in App.tsx)
            onSelectedGameChange(groupId);
            onSearchChange('');
            setMenuOpen(false);
        }
    };

    const handleSubCategoryClick = (key: CategoryKey) => {
        onSelectedGameChange(key);
        onSearchChange(CATEGORY_LABELS[key]);
        setMenuOpen(false);
    };

    const currentGroup = CATEGORY_STRUCTURE.find(g => g.id === hoveredGroupId);

    return (
        <div className={styles.filterHub}>
            {/* Hàng 1: Game & Search & Sắp xếp */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Tìm Tài Khoản:</div>
                <div className={styles.filterGroups}>
                    {/* Game Searchable Selector */}
                    <div className={styles.gameSelector} ref={containerRef}>
                        <div className={styles.searchWrapper}>
                            <Search size={16} className={styles.searchIconSide} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Nhập tên game hoặc từ khóa..."
                                value={searchQuery}
                                onChange={(e) => {
                                    onSearchChange(e.target.value);
                                    if (!menuOpen) setMenuOpen(true);
                                }}
                                onFocus={() => setMenuOpen(true)}
                            />
                            {searchQuery && (
                                <button className={styles.clearSearch} onClick={() => onSearchChange('')}>
                                    <X size={14} />
                                </button>
                            )}
                            <ChevronDown
                                size={14}
                                className={styles.chevron}
                                style={{ transform: menuOpen ? 'rotate(180deg)' : 'none' }}
                                onClick={() => setMenuOpen(!menuOpen)}
                            />
                        </div>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    className={styles.gameDropdown}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    onMouseLeave={() => setHoveredGroupId(null)}
                                >
                                    {/* Level 1: Main Groups */}
                                    <div className={styles.level1Menu}>
                                        <button
                                            className={`${styles.gameOption} ${selectedGame === 'All' ? styles.active : ''}`}
                                            onMouseEnter={() => setHoveredGroupId(null)}
                                            onClick={() => handleGroupClick('All')}
                                        >
                                            Tất cả Danh mục
                                        </button>
                                        {CATEGORY_STRUCTURE.map(group => (
                                            <button
                                                key={group.id}
                                                className={`${styles.gameOption} ${selectedGame === group.id ? styles.active : ''} ${hoveredGroupId === group.id ? styles.hovered : ''}`}
                                                onMouseEnter={() => setHoveredGroupId(group.id)}
                                                onClick={() => handleGroupClick(group.id)}
                                            >
                                                <span>{group.label}</span>
                                                <ChevronRight size={14} opacity={0.5} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Level 2: Subcategories (shown for hovered group) */}
                                    {hoveredGroupId && currentGroup && (
                                        <div className={styles.level2Menu}>
                                            {currentGroup.items.map((key) => (
                                                <button
                                                    key={key}
                                                    className={`${styles.gameOption} ${selectedGame === key ? styles.active : ''}`}
                                                    onClick={() => handleSubCategoryClick(key)}
                                                >
                                                    {CATEGORY_LABELS[key]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={styles.dividerVertical} />

                    <div className={styles.sortWrapper}>
                        <div className={styles.filterLabelSmall}>Sắp xếp:</div>
                        <select
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                        >
                            <option value="newest">Bài đăng mới nhất</option>
                            <option value="price_asc">Giá giảm dần</option>
                            <option value="price_desc">Giá tăng dần</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Hàng 2: Phí trung gian & Khoảng giá */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Phí trung gian:</div>
                <div className={styles.filterGroups}>
                    <div className={styles.feeWrapper}>
                        <div className={styles.feeGroup}>
                            {feeOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`${styles.filterChip} ${feePayer === opt.value ? styles.active : ''}`}
                                    onClick={() => onFeePayerChange(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.dividerVertical} />

                    <div className={styles.priceInputs}>
                        <div className={styles.filterLabelSmall}>Khoảng giá:</div>
                        <div className={styles.priceInputWrapper}>
                            <Banknote size={14} />
                            <input
                                type="number"
                                placeholder="Từ"
                                value={minPrice}
                                onChange={(e) => onMinPriceChange(e.target.value)}
                            />
                        </div>
                        <span className={styles.priceTo}>-</span>
                        <div className={styles.priceInputWrapper}>
                            <Banknote size={14} />
                            <input
                                type="number"
                                placeholder="đến"
                                value={maxPrice}
                                onChange={(e) => onMaxPriceChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Hàng 3: Loại tài khoản */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Loại tài khoản:</div>
                <div className={styles.filterGroups}>
                    {typeOptions.map(opt => (
                        <button
                            key={opt.value}
                            className={`${styles.filterChip} ${accType === opt.value ? styles.active : ''}`}
                            onClick={() => onAccTypeChange(opt.value)}
                        >
                            {opt.value === 'Email' ? <Mail size={14} /> : <CheckCircle2 size={14} />}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
