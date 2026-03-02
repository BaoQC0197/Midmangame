// src/api/orders.ts
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus, CreateOrderPayload } from '../types/order';

export async function createOrder(payload: CreateOrderPayload): Promise<number> {
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone,
            address: payload.address,
            note: payload.note || null,
            total_price: payload.total_price,
            status: 'pending',
        })
        .select('id')
        .single();

    if (orderError) throw orderError;

    // 2. Insert order_items
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

    return order.id;
}

export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getOrders error:', error);
        return [];
    }

    return data as Order[];
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteOrder(id: number): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
