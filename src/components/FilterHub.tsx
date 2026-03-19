import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ChevronDown, Search, X, Banknote } from 'lucide-react';
import styles from './FilterHub.module.css';
import { Category } from '../api/categories';
import { formatVND, parseVND } from '../lib/utils';

interface FilterHubProps {
    categories: Category[];
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
    categories,
    selectedGame, onSelectedGameChange,
    searchQuery, onSearchChange,
    sortBy, onSortChange,
    feePayer, onFeePayerChange,
    accType, onAccTypeChange,
    minPrice, onMinPriceChange,
    maxPrice, onMaxPriceChange
}: FilterHubProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Group categories by group_id
    const groupedCategories = useMemo(() => {
        const groups: Record<string, { label: string; icon: string; items: Category[] }> = {};
        categories.forEach(cat => {
            if (!groups[cat.group_id]) {
                groups[cat.group_id] = {
                    label: cat.group_label,
                    icon: cat.group_id === 'game' ? '/src/assets/categories/game.png' : 
                          cat.group_id === 'social' ? '/src/assets/categories/social.png' : 
                          '/src/assets/categories/service.png',
                    items: []
                };
            }
            groups[cat.group_id].items.push(cat);
        });
        return groups;
    }, [categories]);

    // Derive Searchable Labels
    const categoryLabels = useMemo(() => {
        const labels: Record<string, string> = {};
        categories.forEach(cat => {
            labels[cat.id] = cat.name;
        });
        return labels;
    }, [categories]);

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

    // Clicks outside to close search dropdown or category dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
                setActiveGroupId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTabClick = (groupId: string) => {
        if (groupId === 'All') {
            onSelectedGameChange('All');
            onSearchChange('');
            setActiveGroupId(null);
        } else {
            // Toggle active group for expansion
            if (activeGroupId === groupId) {
                setActiveGroupId(null);
            } else {
                setActiveGroupId(groupId);
                onSelectedGameChange(groupId);
                onSearchChange('');
            }
        }
    };

    const handleItemClick = (categoryId: string, categoryName: string) => {
        onSelectedGameChange(categoryId);
        onSearchChange(categoryName);
        // Maybe close expansion after selection? Or keep it.
    };

    const getIcon = (cat: Category) => {
        return cat.icon_url || groupedCategories[cat.group_id]?.icon || '/src/assets/categories/game.png';
    };

    // Filter subcategories for search results
    const filteredSearchItems = searchQuery.length > 0 
        ? Object.entries(categoryLabels).filter(([_, label]) => 
            label.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    return (
        <div className={styles.filterHub} ref={containerRef}>
            {/* Hàng 0: Danh mục (Tab view with Dropdowns) */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Danh mục:</div>
                <div className={styles.categoryTabs}>
                    <button
                        className={`${styles.categoryTab} ${selectedGame === 'All' ? styles.active : ''}`}
                        onClick={() => handleTabClick('All')}
                    >
                        <div className={styles.tabIcon}>
                            <ChevronDown size={14} />
                        </div>
                        <span>Tất cả</span>
                    </button>

                    {Object.entries(groupedCategories).map(([groupId, group]) => (
                        <div key={groupId} className={styles.tabWrapper}>
                            <button
                                className={`${styles.categoryTab} ${activeGroupId === groupId || selectedGame === groupId || categories.find(c => c.id === selectedGame)?.group_id === groupId ? styles.active : ''}`}
                                onClick={() => handleTabClick(groupId)}
                            >
                                <div className={styles.tabIcon}>
                                    <img src={group.icon} alt={group.label} />
                                </div>
                                <span>{group.label}</span>
                                <ChevronDown 
                                    size={12} 
                                    style={{ 
                                        marginLeft: 4, 
                                        opacity: 0.5, 
                                        transform: activeGroupId === groupId ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s ease'
                                    }} 
                                />
                            </button>

                            <AnimatePresence>
                                {activeGroupId === groupId && (
                                    <motion.div
                                        className={styles.categoryDropdown}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                    >
                                        {group.items.map(item => (
                                            <button
                                                key={item.id}
                                                className={`${styles.dropdownItem} ${selectedGame === item.id ? styles.active : ''}`}
                                                onClick={() => {
                                                    handleItemClick(item.id, item.name);
                                                    setActiveGroupId(null); // Close dropdown after selection
                                                }}
                                            >
                                                <div className={styles.dropdownIcon}>
                                                    <img src={getIcon(item)} alt={item.name} />
                                                </div>
                                                <span className={styles.dropdownLabel}>{item.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.divider} />

            {/* Hàng 1: Tìm Tài Khoản & Giá & Sắp xếp */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Tìm & Giá:</div>
                <div className={styles.filterGroups}>
                    <div className={styles.gameSelector}>
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
                            {menuOpen && searchQuery.length > 0 && (
                                <motion.div
                                    className={styles.gameDropdown}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                >
                                    <div className={styles.searchResults}>
                                        {filteredSearchItems.length > 0 ? (
                                            filteredSearchItems.map(([key, label]) => {
                                                const cat = categories.find(c => c.id === key);
                                                return (
                                                    <button
                                                        key={key}
                                                        className={styles.searchResultItem}
                                                        onClick={() => {
                                                            handleItemClick(key, label);
                                                            setMenuOpen(false);
                                                        }}
                                                    >
                                                        <div className={styles.resultIcon}>
                                                            <img src={cat ? getIcon(cat) : '/src/assets/categories/game.png'} alt="" style={{ width: '100%', height: '100%', borderRadius: 6, objectFit: 'cover' }} />
                                                        </div>
                                                        <div className={styles.resultInfo}>
                                                            <div className={styles.resultLabel}>{label}</div>
                                                            <div className={styles.resultCategory}>
                                                                {cat?.group_label}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        ) : searchQuery.length > 0 && (
                                            <div className={styles.noResults}>
                                                Không tìm thấy kết quả
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className={styles.dividerVertical} />

                    <div className={styles.priceInputs}>
                        <div className={styles.filterLabelSmall}>Giá:</div>
                        <div className={styles.priceInputWrapper}>
                            <Banknote size={14} />
                            <input
                                type="text"
                                placeholder="Từ"
                                value={formatVND(minPrice)}
                                onChange={(e) => onMinPriceChange(parseVND(e.target.value))}
                            />
                        </div>
                        <span className={styles.priceTo}>-</span>
                        <div className={styles.priceInputWrapper}>
                            <Banknote size={14} />
                            <input
                                type="text"
                                placeholder="đến"
                                value={formatVND(maxPrice)}
                                onChange={(e) => onMaxPriceChange(parseVND(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={styles.dividerVertical} />

                    <div className={styles.sortWrapper}>
                        <div className={styles.filterLabelSmall}>Sắp xếp:</div>
                        <select
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                        >
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Hàng 2: Loại & Phí */}
            <div className={styles.filterRow}>
                <div className={styles.filterLabel}>Phí & Loại:</div>
                <div className={styles.filterGroups}>
                    <div className={styles.typeWrapper}>
                        <div className={styles.filterLabelSmall}>Loại:</div>
                        <div className={styles.typeGroup}>
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

                    <div className={styles.dividerVertical} />

                    <div className={styles.feeWrapper}>
                        <div className={styles.filterLabelSmall}>Phí:</div>
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
                </div>
            </div>
        </div>
    );
}
