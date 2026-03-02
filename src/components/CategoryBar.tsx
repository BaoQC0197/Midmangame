// src/components/CategoryBar.tsx

const CATEGORIES = [
    { key: 'all', label: 'Tất cả' },
    { key: 'but', label: 'Bút viết' },
    { key: 'vo', label: 'Vở' },
    { key: 'dungcu', label: 'Dụng cụ học tập' },
    { key: 'mythuat', label: 'Mỹ thuật' },
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
                    <a
                        key={cat.key}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onFilter(cat.key);
                        }}
                        style={{
                            color: activeCategory === cat.key ? '#15803d' : undefined,
                            fontWeight: activeCategory === cat.key ? 700 : undefined,
                        }}
                    >
                        {cat.label}
                    </a>
                ))}
            </div>
        </div>
    );
}
