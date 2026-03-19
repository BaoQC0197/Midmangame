// src/api/categories.ts
import { supabase } from '../lib/supabase';

export interface Category {
    id: string; // e.g. 'genshin'
    name: string; // e.g. 'Genshin Impact'
    group_id: string; // e.g. 'game'
    group_label: string; // e.g. 'Game'
    icon_url?: string;
    sort_order?: number;
}

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.warn('Categories table might not exist yet. Using fallback.');
        return [];
    }
    return data || [];
}

export async function upsertCategory(category: Category) {
    const { error } = await supabase
        .from('categories')
        .upsert([category]);

    if (error) throw error;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
