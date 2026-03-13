// src/api/profiles.ts
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    spin_turns: number;
    created_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateSpinTurns(userId: string, turns: number) {
    console.log('Updating spin turns for:', userId, 'to:', turns);
    const { error } = await supabase
        .from('profiles')
        .update({ spin_turns: turns })
        .eq('id', userId);

    if (error) {
        console.error('Full update error:', error);
        throw error;
    }
}

export async function useSpinTurn(userId: string, accountId: string, result: { type: 'hot' | 'discount' | 'none', value?: number }) {
    // 1. Giảm lượt quay
    const { data: profile } = await supabase.from('profiles').select('spin_turns').eq('id', userId).single();
    if (!profile || profile.spin_turns <= 0) throw new Error('Không còn lượt quay');

    const { error: turnError } = await supabase
        .from('profiles')
        .update({ spin_turns: profile.spin_turns - 1 })
        .eq('id', userId);
    
    if (turnError) throw turnError;

    // 2. Áp dụng kết quả cho account
    if (result.type === 'hot' && result.value) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + result.value);
        
        await supabase
            .from('trade_accounts')
            .update({ 
                promotion: 'Hot', 
                hot_at: new Date().toISOString(),
                hot_expires_at: expiresAt.toISOString()
            })
            .eq('id', accountId);
    } else if (result.type === 'discount' && result.value) {
        await supabase
            .from('trade_accounts')
            .update({ fee_discount: result.value })
            .eq('id', accountId);
    }
}
export async function getProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
