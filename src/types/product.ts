// src/types/product.ts

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    category?: string;
}

export type ProductInput = Omit<Product, 'id'>;
