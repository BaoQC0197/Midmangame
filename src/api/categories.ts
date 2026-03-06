/**
 * src/api/categories.ts
 * 
 * TẦNG GIAO TIẾP DỮ LIỆU (API Layer) - DANH MỤC
 * --------------------------------------------
 * File này quản lý các "ngăn kệ" của cửa hàng.
 */
import { supabase } from '../lib/supabase';
import type { Category, CategoryInput } from '../types/category';

// HÀM: LẤY TẤT CẢ DANH MỤC
export async function getCategories(): Promise<Category[]> {
    // Sắp xếp theo trường `sort_order` để Admin có thể tự xếp thứ tự ưu tiên
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Lỗi lấy danh mục:', error);
        return [];
    }
    return data as Category[];
}

// HÀM: THÊM DANH MỤC MỚI
export async function addCategory(input: Omit<CategoryInput, 'sort_order'>): Promise<void> {
    const { error } = await supabase.from('categories').insert([{
        ...input,
        sort_order: 50, // Mặc định để 50 để dễ dàng chèn vào giữa
    }]);
    if (error) throw error;
}

// HÀM: CẬP NHẬT THÔNG TIN DANH MỤC (Tên, Icon, Thứ tự)
export async function updateCategory(id: number, data: Partial<Pick<Category, 'label' | 'icon' | 'sort_order'>>): Promise<void> {
    const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);
    if (error) throw error;
}

/**
 * HÀM: XÓA DANH MỤC
 * Bím giải thích: Khi xóa một danh mục (ví dụ: Xóa "Bút bi"),
 * chúng ta không thể để các sản phẩm "Bút bi" bơ vơ.
 * Bím sẽ tự động dời tất cả sản phẩm đó sang mục "Khác" (khac).
 */
export async function deleteCategory(id: number, key: string): Promise<void> {
    // 1. Chuyển sản phẩm sang nhóm 'Khác'
    const { error: updateErr } = await supabase
        .from('products')
        .update({ category: 'khac' })
        .eq('category', key);
    if (updateErr) throw updateErr;

    // 2. Xóa hẳn danh mục khỏi kệ
    const { error: deleteErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (deleteErr) throw deleteErr;
}
