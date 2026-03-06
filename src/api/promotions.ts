/**
 * src/api/promotions.ts
 * 
 * TẦNG GIAO TIẾP DỮ LIỆU (API Layer) - KHUYẾN MÃI
 * ----------------------------------------------
 * File này giúp Bím quản lý các chương trình giảm giá, 
 * tạo ra các nhãn "SALE" hay "GIẢM 20%" cho sản phẩm.
 */
import { supabase } from '../lib/supabase';
import type { Promotion } from '../types/promotion';

// HÀM: LẤY CÁC KHUYẾN MÃI ĐANG CÒN HIỆU LỰC
export async function getActivePromotions(): Promise<Promotion[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true) // Phải đang ở trạng thái kích hoạt
        .or(`ends_at.is.null,ends_at.gte.${now}`) // Chưa hết hạn hoặc không có ngày hết hạn
        .order('created_at', { ascending: false });

    if (error) { console.error('Lỗi lấy khuyến mãi đang chạy:', error); return []; }
    return data as Promotion[];
}

// HÀM: LẤY TẤT CẢ KHUYẾN MÃI (Kể cả đã hết hạn - cho Admin xem)
export async function getAllPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) { console.error('Lỗi lấy toàn bộ khuyến mãi:', error); return []; }
    return data as Promotion[];
}

export interface CreatePromotionPayload {
    product_id: number;
    sale_price: number;
    label: string;
    ends_at: string | null;
}

// HÀM: TẠO KHUYẾN MÃI MỚI
export async function createPromotion(payload: CreatePromotionPayload): Promise<void> {
    const { error } = await supabase.from('promotions').insert({
        ...payload,
        active: true, // Mặc định tạo xong là cho chạy luôn
    });
    if (error) throw error;
}

// HÀM: CẬP NHẬT HOẶC TẮT/MỞ KHUYẾN MÃI
export async function updatePromotion(id: number, payload: Partial<CreatePromotionPayload & { active: boolean }>): Promise<void> {
    const { error } = await supabase.from('promotions').update(payload).eq('id', id);
    if (error) throw error;
}

// HÀM: XÓA KHUYẾN MÃI
export async function deletePromotion(id: number): Promise<void> {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
}
