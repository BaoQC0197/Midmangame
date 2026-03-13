// src/api/accounts.ts
import { supabase } from '../lib/supabase';
import type { TradeAccount, AccountInput } from '../types/account';

export async function getAccounts(): Promise<TradeAccount[]> {
    const { data, error } = await supabase
        .from('trade_accounts')
        .select(`
            *,
            transaction_tickets (
                id,
                status
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to TradeAccount type
    return (data || []).map(item => {
        // Kiểm tra xem có ticket nào đang xử lý không
        const activeTickets = (item.transaction_tickets || []).filter((t: any) => 
            ['matched', 'trading'].includes(t.status)
        );

        // Check for promotion expiry
        let promotion = item.promotion;
        const now = new Date();
        
        if (promotion === 'Hot' && (item.hot_expires_at || item.hot_at)) {
            const expiryDate = item.hot_expires_at ? new Date(item.hot_expires_at) : null;
            const hotDate = item.hot_at ? new Date(item.hot_at) : null;
            
            if (expiryDate && now > expiryDate) {
                promotion = 'None';
            } else if (!expiryDate && hotDate) {
                // Default 7 days if no expiry date set (legacy support)
                const diffDays = (now.getTime() - hotDate.getTime()) / (1000 * 3600 * 24);
                if (diffDays > 7) promotion = 'None';
            }
        }

        return {
            ...item,
            title: item.name,
            thumbnail: item.thumbnail,
            images: item.images || [],
            game: item.game,
            server: item.server,
            account_type: item.rank,
            promotion,
            is_sold: !!item.is_sold,
            status: item.status || 'approved', // Mặc định là approved cho các bài cũ
            has_active_ticket: activeTickets.length > 0
        };
    });
}

export async function addAccount(account: AccountInput) {
    const { data, error } = await supabase
        .from('trade_accounts')
        .insert([{
            name: account.title,
            thumbnail: account.thumbnail,
            images: account.images || [],
            price: account.price,
            description: account.description,
            game: account.game,
            server: account.server || 'Asia',
            rank: account.account_type || 'Starter',
            is_sold: false,
            seller_id: account.seller_id,
            seller_phone: (account as any).seller_phone,
            fee_payer: (account as any).fee_payer || 'seller',
            status: 'pending'
        }])
        .select()
        .single();

    if (error) throw error;
    return data.id;
}

export async function updateAccount(id: string, updates: Partial<TradeAccount>) {
    const { error } = await supabase
        .from('trade_accounts')
        .update({
            name: updates.title,
            thumbnail: updates.thumbnail,
            price: updates.price,
            description: updates.description,
            game: updates.game,
            server: updates.server,
            rank: updates.account_type,
            is_sold: updates.is_sold,
            promotion: updates.promotion
        })
        .eq('id', id);

    if (error) throw error;
}

export async function togglePromotion(id: string, type: 'Hot' | 'Gợi ý' | 'None') {
    const updates: any = { promotion: type };
    if (type === 'Hot') {
        updates.hot_at = new Date().toISOString();
    } else {
        updates.hot_at = null;
    }

    const { error } = await supabase
        .from('trade_accounts')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('TogglePromotion Error:', error);
        throw error;
    }
}

export async function deleteAccount(id: string) {
    const { error } = await supabase
        .from('trade_accounts')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function getUserAccounts(userId: string): Promise<TradeAccount[]> {
    const { data, error } = await supabase
        .from('trade_accounts')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
        ...item,
        title: item.name,
        thumbnail: item.thumbnail,
        images: item.images || [],
        promotion: item.promotion || 'None',
        is_sold: !!item.is_sold,
        status: item.status || 'pending'
    }));
}

export async function approveAccount(id: string) {
    const { error } = await supabase
        .from('trade_accounts')
        .update({ status: 'approved' })
        .eq('id', id);

    if (error) throw error;
}

export async function rejectAccount(id: string) {
    const { error } = await supabase
        .from('trade_accounts')
        .update({ status: 'rejected' })
        .eq('id', id);

    if (error) throw error;
}
