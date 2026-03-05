// src/types/category.ts

export interface Category {
    id: number;
    key: string;
    label: string;
    icon: string;
    sort_order: number;
}

export type CategoryInput = Omit<Category, 'id'>;
