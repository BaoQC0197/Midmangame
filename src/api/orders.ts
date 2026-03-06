/**
 * src/api/orders.ts
 * 
 * TẦNG GIAO TIẾP DỮ LIỆU (API Layer) - ĐƠN HÀNG
 * --------------------------------------------
 * File này quản lý toàn bộ "số phận" của một đơn hàng: từ lúc khách 
 * bấm nút "Đặt mua", lưu vào database cho đến khi gửi mail thông báo.
 */
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';
import type { Order, OrderStatus, CreateOrderPayload } from '../types/order';

// HÀM QUAN TRỌNG: TẠO ĐƠN HÀNG MỚI
export async function createOrder(payload: CreateOrderPayload): Promise<number> {
    // 1. Lưu thông tin chung của đơn hàng (Tên, SĐT, Địa chỉ, Tổng tiền)
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            address: payload.address,
            note: payload.note || null,
            total_price: payload.total_price,
            status: 'pending', // Mặc định là 'chờ xử lý'
            is_read: false,    // Admin chưa đọc đơn này
        })
        .select('id')
        .single();

    if (orderError) throw orderError;

    // 2. Lưu chi tiết từng món hàng trong đơn (Sản phẩm gì, số lượng bao nhiêu)
    const orderItems = payload.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) throw itemsError;

    return order.id; // Trả về ID đơn hàng để web hiện thông báo thành công
}

// HÀM: LẤY TẤT CẢ ĐƠN HÀNG (Dành cho Admin)
export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Lỗi lấy danh sách đơn hàng:', error);
        return [];
    }

    return data as Order[];
}

// HÀM: TRA CỨU ĐƠN HÀNG THEO SỐ ĐIỆN THOẠI (Dành cho khách hàng)
export async function getOrdersByPhone(phone: string): Promise<Order[]> {
    const cleaned = phone.replace(/\s/g, ''); // Xóa hết khoảng trắng trước khi tra
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_phone', cleaned)
        .order('created_at', { ascending: false });

    if (error) { console.error('Lỗi tra cứu đơn hàng:', error); return []; }
    return data as Order[];
}

// HÀM: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (Chờ duyệt -> Đang giao -> Đã giao...)
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

// HÀM: ĐÁNH DẤU ĐƠN HÀNG ĐÃ ĐỌC (Dành cho Admin)
export async function markOrderAsRead(id: number): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
}

// HÀM: XÓA ĐƠN HÀNG
export async function deleteOrder(id: number): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * HÀM: GỬI THÔNG BÁO EMAIL (Dùng EmailJS)
 * Bím gọi hàm này sau khi đơn hàng được tạo để báo cho khách hoặc chủ shop biết.
 */
export async function sendEmailNotification(order: any) {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Chuyển mảng các món hàng thành dạng danh sách dễ đọc trong Email
    const itemsList = order.items
        .map((item: any) => `- ${item.name} x ${item.qty}`)
        .join('\n');

    const templateParams = {
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        total_price: order.total_price.toLocaleString('vi-VN'),
        items_list: itemsList,
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('Đã gửi Email thông báo thành công!', response.status, response.text);
    } catch (error) {
        console.error('Gửi Email thất bại:', error);
    }
}
