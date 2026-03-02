// src/api/products.ts
import { supabase } from '../lib/supabase';
import type { Product, ProductInput } from '../types/product';

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('getProducts error:', error);
        return [];
    }

    return data as Product[];
}

export async function addProduct(product: ProductInput): Promise<void> {
    const { error } = await supabase.from('products').insert([product]);
    if (error) throw error;
}

export async function deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
}

export async function updateProduct(
    id: number,
    updatedData: Partial<ProductInput>
): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id);
    if (error) throw error;
}

export async function getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as Product;
}
