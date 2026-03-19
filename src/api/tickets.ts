// src/api/tickets.ts
import { supabase } from '../lib/supabase';
import type { TransactionTicket, CreateTicketPayload, TicketStatus } from '../types/ticket';

// Tạo Jitsi room URL tự động
function generateRoomUrl(ticketId: string): string {
    const shortId = ticketId.replace(/-/g, '').slice(0, 10);
    return `https://meet.jit.si/EasyTrade-${shortId}`;
}

export async function getTickets(): Promise<TransactionTicket[]> {
    const { data, error } = await supabase
        .from('transaction_tickets')
        .select(`
            *,
            trade_accounts (
                name,
                price,
                game,
                seller_id,
                seller_phone
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        account_id: item.account_id,
        account_title: item.trade_accounts?.name,
        account_price: item.trade_accounts?.price,
        account_game: item.trade_accounts?.game,
        buyer_contact: item.buyer_contact || item.buyer_phone || '',
        buyer_phone: item.buyer_phone || item.buyer_contact || '',
        buyer_user_id: item.buyer_user_id,
        seller_contact: item.seller_contact || item.seller_phone || item.trade_accounts?.seller_phone || '',
        seller_phone: item.seller_phone || item.seller_contact || item.trade_accounts?.seller_phone || '',
        seller_user_id: item.seller_user_id || item.trade_accounts?.seller_id,
        midman_id: item.midman_id,
        price: item.trade_accounts?.price || 0,
        fee: item.fee || 0,
        status: item.status as TicketStatus,
        note: item.note,
        admin_notes: item.admin_notes,
        room_url: item.room_url,
        checklist: item.checklist as any,
        audit_log: item.audit_log as any,
        matched_at: item.matched_at,
        trading_at: item.trading_at,
        completed_at: item.completed_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
    }));
}

// Helper tự động ghi log
async function addAuditLog(ticketId: string, action: string, details?: string) {
    const { data: current } = await supabase
        .from('transaction_tickets')
        .select('audit_log')
        .eq('id', ticketId)
        .single();

    const logs = (current?.audit_log as any[]) || [];
    const newLog = {
        timestamp: new Date().toISOString(),
        action,
        details,
    };

    await supabase
        .from('transaction_tickets')
        .update({ audit_log: [...logs, newLog] })
        .eq('id', ticketId);
}

export async function createTicket(payload: CreateTicketPayload) {
    // 1. Kiểm tra xem sản phẩm đã có ticket nào đang hoạt động chưa
    // Các trạng thái được coi là "đang xử lý": pending_match, matched, trading
    const { data: existing, error: checkError } = await supabase
        .from('transaction_tickets')
        .select('id')
        .eq('account_id', payload.account_id)
        .in('status', ['pending_match', 'matched', 'trading'])
        .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
        throw new Error('Sản phẩm này hiện đang có người đặt mua. Vui lòng chọn sản phẩm khác hoặc đợi Admin xử lý.');
    }

    // 2. Lấy seller_id và price từ account để gắn vào ticket và tính phí TỔNG ngay từ đầu
    const { data: accountData } = await supabase
        .from('trade_accounts')
        .select('seller_id, price')
        .eq('id', payload.account_id)
        .single();

    const { data: ticket, error } = await supabase
        .from('transaction_tickets')
        .insert([{
            account_id: payload.account_id,
            buyer_phone: payload.buyer_phone,
            buyer_contact: payload.buyer_phone,
            buyer_user_id: payload.buyer_user_id,
            seller_user_id: accountData?.seller_id,
            midman_id: payload.midman_id,
            status: 'pending_match',
            note: payload.note,
            fee: accountData?.price ? Math.max(accountData.price * 0.05, 30000) : 30000,
        }])
        .select()
        .single();

    if (error) throw error;
    return ticket.id;
}

export async function updateTicketFull(
    id: string,
    updates: { status: TicketStatus; admin_notes?: string }
) {
    const now = new Date().toISOString();
    const extraFields: Record<string, string | null> = {};

    // Tự động gắn timestamps khi chuyển trạng thái
    if (updates.status === 'matched') extraFields.matched_at = now;
    if (updates.status === 'completed') extraFields.completed_at = now;

    // Khi sang TRADING → tự tạo Jitsi room URL
    let room_url: string | undefined;
    if (updates.status === 'trading') {
        extraFields.trading_at = now;
        const { data: current } = await supabase
            .from('transaction_tickets')
            .select('room_url')
            .eq('id', id)
            .single();

        if (!current?.room_url) {
            room_url = generateRoomUrl(id);
            extraFields.room_url = room_url;
        }
    }

    const { error } = await supabase
        .from('transaction_tickets')
        .update({
            status: updates.status,
            admin_notes: updates.admin_notes,
            updated_at: now,
            ...extraFields,
        })
        .eq('id', id);

    if (error) throw error;

    // Tự động ghi log khi đổi status
    await addAuditLog(id, `Chuyển trạng thái: ${updates.status}`);

    // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI "ĐÃ BÁN" CHO ACCOUNT
    if (updates.status === 'completed') {
        const { data: ticketData } = await supabase
            .from('transaction_tickets')
            .select('account_id')
            .eq('id', id)
            .single();
        
        if (ticketData?.account_id) {
            await supabase
                .from('trade_accounts')
                .update({ is_sold: true })
                .eq('id', ticketData.account_id);
        }
    }

    return room_url;
}

export async function updateTicketChecklist(id: string, checklist: any) {
    const { error } = await supabase
        .from('transaction_tickets')
        .update({ checklist })
        .eq('id', id);

    if (error) throw error;
    await addAuditLog(id, 'Cập nhật Checklist', JSON.stringify(checklist));
}

// Lấy ticket đang TRADING của user (để hiển thị TradeRoomBanner)
export async function getMyActiveTicket(userId: string): Promise<TransactionTicket | null> {
    const { data, error } = await supabase
        .from('transaction_tickets')
        .select(`*, trade_accounts(name, price, game, seller_id, seller_phone)`)
        .eq('status', 'trading')
        .or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`)
        .order('trading_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) return null;

    return {
        id: data.id,
        account_id: data.account_id,
        account_title: data.trade_accounts?.name,
        account_price: data.trade_accounts?.price,
        account_game: data.trade_accounts?.game,
        buyer_contact: data.buyer_phone || data.buyer_contact || '',
        buyer_phone: data.buyer_phone || '',
        buyer_user_id: data.buyer_user_id,
        seller_contact: data.seller_phone || data.seller_contact || data.trade_accounts?.seller_phone || '',
        seller_phone: data.seller_phone || data.seller_contact || data.trade_accounts?.seller_phone || '',
        seller_user_id: data.seller_user_id || data.trade_accounts?.seller_id,
        midman_id: data.midman_id,
        price: data.trade_accounts?.price || 0,
        fee: data.fee || 0,
        status: data.status as TicketStatus,
        note: data.note,
        admin_notes: data.admin_notes,
        room_url: data.room_url,
        checklist: data.checklist as any,
        audit_log: data.audit_log as any,
        matched_at: data.matched_at,
        trading_at: data.trading_at,
        completed_at: data.completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

// Giữ lại hàm cũ updateTicketStatus để tránh break code khác
export async function updateTicketStatus(id: string, status: string) {
    return updateTicketFull(id, { status: status as TicketStatus });
}

export async function getUserBuyRequests(userId: string): Promise<TransactionTicket[]> {
    const { data, error } = await supabase
        .from('transaction_tickets')
        .select(`
            *,
            trade_accounts (
                name,
                price,
                game,
                thumbnail
            )
        `)
        .eq('buyer_user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        account_id: item.account_id,
        account_title: item.trade_accounts?.name,
        account_price: item.trade_accounts?.price,
        account_game: item.trade_accounts?.game,
        account_thumbnail: item.trade_accounts?.thumbnail,
        buyer_contact: item.buyer_phone || '',
        buyer_phone: item.buyer_phone || '',
        buyer_user_id: item.buyer_user_id,
        seller_user_id: item.seller_user_id,
        midman_id: item.midman_id,
        price: item.trade_accounts?.price || 0,
        fee: item.fee || 0,
        status: item.status as TicketStatus,
        note: item.note,
        room_url: item.room_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
    } as any));
}

export async function getMidmanCompletedTickets(userId: string): Promise<TransactionTicket[]> {
    const { data, error } = await supabase
        .from('transaction_tickets')
        .select(`
            *,
            trade_accounts (
                name,
                price,
                game,
                thumbnail
            )
        `)
        .eq('midman_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

    if (error) {
        console.warn('Lỗi query midman tickets (có thể chưa chạy SQL thêm cột midman_id):', error);
        return [];
    }

    return (data || []).map(item => ({
        id: item.id,
        account_id: item.account_id,
        account_title: item.trade_accounts?.name,
        account_price: item.trade_accounts?.price,
        account_game: item.trade_accounts?.game,
        account_thumbnail: item.trade_accounts?.thumbnail,
        buyer_contact: item.buyer_phone || '',
        buyer_phone: item.buyer_phone || '',
        buyer_user_id: item.buyer_user_id,
        seller_user_id: item.seller_user_id,
        midman_id: item.midman_id,
        price: item.trade_accounts?.price || 0,
        fee: item.fee || 0,
        status: item.status as TicketStatus,
        note: item.note,
        room_url: item.room_url,
        created_at: item.created_at,
        updated_at: item.updated_at,
        completed_at: item.completed_at
    } as any));
}

export async function getMidmanPendingRequests(userId: string): Promise<TransactionTicket[]> {
    const { data, error } = await supabase
        .from('transaction_tickets')
        .select(`
            *,
            trade_accounts (
                name,
                price,
                game,
                thumbnail
            )
        `)
        .eq('midman_id', userId)
        .in('status', ['pending_match', 'matched', 'trading'])
        .order('created_at', { ascending: false });

    if (error) {
        console.warn('Lỗi query midman pending tickets:', error);
        return [];
    }

    return (data || []).map(item => ({
        id: item.id,
        account_id: item.account_id,
        account_title: item.trade_accounts?.name,
        account_price: item.trade_accounts?.price,
        account_game: item.trade_accounts?.game,
        account_thumbnail: item.trade_accounts?.thumbnail,
        buyer_contact: item.buyer_phone || '',
        buyer_phone: item.buyer_phone || '',
        buyer_user_id: item.buyer_user_id,
        seller_user_id: item.seller_user_id,
        midman_id: item.midman_id,
        price: item.trade_accounts?.price || 0,
        fee: item.fee || 0,
        status: item.status as TicketStatus,
        note: item.note,
        room_url: item.room_url,
        created_at: item.created_at,
        updated_at: item.updated_at
    } as any));
}
