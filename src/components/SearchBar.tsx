// src/components/SearchBar.tsx
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="search-bar-wrapper">
            <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="search-input"
                />
                {value && (
                    <button
                        className="search-clear"
                        onClick={() => onChange('')}
                        title="Xoá tìm kiếm"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
