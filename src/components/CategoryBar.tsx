// src/components/CategoryBar.tsx

const CATEGORIES = [
    { key: 'all', label: 'Tất cả', icon: '🏪' },
    { key: 'but', label: 'Bút viết', icon: '✏️' },
    { key: 'vo', label: 'Vở', icon: '📓' },
    { key: 'dungcu', label: 'Dụng cụ HT', icon: '📐' },
    { key: 'mythuat', label: 'Mỹ thuật', icon: '🎨' },
] as const;

interface CategoryBarProps {
    activeCategory: string;
    onFilter: (category: string) => void;
}

export default function CategoryBar({ activeCategory, onFilter }: CategoryBarProps) {
    return (
        <div className="category-bar">
            <div className="container category-list">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        className={`category-pill${activeCategory === cat.key ? ' active' : ''}`}
                        onClick={() => onFilter(cat.key)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
