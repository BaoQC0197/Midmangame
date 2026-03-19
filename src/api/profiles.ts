// src/api/profiles.ts
import { supabase } from '../lib/supabase';

export interface UserProfile {
    id: string;
    email: string;
    spin_turns: number;
    created_at: string;
    role?: string;
    cccd?: string;
    facebook_url?: string;
    rating?: number;
    is_active_midman?: boolean;
    full_name?: string;
}

export interface MidmanApplication {
    id: string;
    user_id: string;
    full_name?: string;
    cccd: string;
    cccd_front_url?: string;
    cccd_back_url?: string;
    facebook_url: string;
    fee_rate?: string;
    working_hours?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profiles?: {
        email: string;
    };
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

// --- MIDMAN APPLICATIONS API ---

export async function applyForMidman(
    userId: string, 
    cccd: string, 
    facebookUrl: string,
    fullName: string,
    cccdFrontUrl: string,
    cccdBackUrl: string,
    feeRate: string,
    workingHours: string
) {
    // Check if there is already a pending application
    const { data: existing } = await supabase
        .from('midman_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

    if (existing) throw new Error('Bạn đã có đơn ứng tuyển đang chờ duyệt.');

    const { error } = await supabase
        .from('midman_applications')
        .insert([{
            user_id: userId,
            full_name: fullName,
            cccd: cccd,
            cccd_front_url: cccdFrontUrl,
            cccd_back_url: cccdBackUrl,
            facebook_url: facebookUrl,
            fee_rate: feeRate,
            working_hours: workingHours,
            status: 'pending'
        }]);

    if (error) throw error;
}

export async function getMidmanApplications(): Promise<MidmanApplication[]> {
    const { data, error } = await supabase
        .from('midman_applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function approveMidmanApplication(appId: string, userId: string) {
    // 1. Update application status
    const { error: appError } = await supabase
        .from('midman_applications')
        .update({ status: 'approved' })
        .eq('id', appId);

    if (appError) throw appError;

    // 2. Lấy thông tin cccd, facebook từ đơn để lưu vào profiles
    const { data: appData } = await supabase
        .from('midman_applications')
        .select('*')
        .eq('id', appId)
        .single();

    if (appData) {
        // 3. Update user profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                role: 'midman',
                is_active_midman: true,
                full_name: appData.full_name, // Sync full_name here!
                cccd: appData.cccd,
                facebook_url: appData.facebook_url
            })
            .eq('id', userId);

        if (profileError) throw profileError;
    }
}

export async function rejectMidmanApplication(appId: string) {
    const { error } = await supabase
        .from('midman_applications')
        .update({ status: 'rejected' })
        .eq('id', appId);

    if (error) throw error;
}

export async function updateProfileInfo(userId: string, data: { cccd?: string, facebook_url?: string }) {
    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    
    if (error) throw error;
}

export async function getActiveMidmanList() {
    try {
        // 1. Lấy tất cả user đã được gán role midman
        const { data: profs, error: profErr } = await supabase
            .from('profiles')
            .select('id, email, is_active_midman, avatar_url')
            .eq('role', 'midman');
            
        if (profErr || !profs || profs.length === 0) return [];
        const activeIds = profs.filter(p => p.is_active_midman !== false).map(p => p.id);
        if (activeIds.length === 0) return [];

        // 2. Lấy thông tin hiển thị ứng dụng
        const { data: apps, error: appErr } = await supabase
            .from('midman_applications')
            .select('id, user_id, full_name, working_hours')
            .eq('status', 'approved')
            .in('user_id', activeIds);

        if (appErr || !apps) return [];

        // 3. Lấy Ratings
        const { data: reviews } = await supabase
            .from('midman_reviews')
            .select('midman_id, rating')
            .in('midman_id', activeIds);

        // 4. Kết hợp kết quả
        return apps.map(app => {
            const matchProf = profs.find(p => p.id === app.user_id);
            
            // Tính toán rating
            const midmanReviews = (reviews || []).filter(r => r.midman_id === app.user_id);
            const totalRating = midmanReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
            const avgRating = midmanReviews.length > 0 ? (totalRating / midmanReviews.length).toFixed(1) : '5.0';

            return {
                ...app,
                email: matchProf?.email,
                avatar_url: matchProf?.avatar_url, // Lấy ảnh profile
                rating: avgRating,
                reviewCount: midmanReviews.length
            };
        });
    } catch (e) {
        console.error("Lỗi getActiveMidmanList:", e);
        return [];
    }
}

export async function getMidmanProfileAndReviews(midmanId: string) {
    try {
        const { data: profs } = await supabase.from('profiles').select('id, email, avatar_url').eq('id', midmanId).single();
        const { data: apps } = await supabase.from('midman_applications').select('full_name, working_hours').eq('user_id', midmanId).eq('status', 'approved').single();
        const { data: reviews } = await supabase.from('midman_reviews').select('reviewer_name, rating, comment, created_at').eq('midman_id', midmanId).order('created_at', { ascending: false });
        
        const totalRating = (reviews || []).reduce((sum, r) => sum + (r.rating || 5), 0);
        const avgRating = (reviews && reviews.length > 0) ? (totalRating / reviews.length).toFixed(1) : '5.0';

        return {
            id: midmanId,
            full_name: apps?.full_name || 'Midman',
            working_hours: apps?.working_hours || 'N/A',
            avatar_url: profs?.avatar_url,
            rating: avgRating,
            reviewCount: reviews?.length || 0,
            reviews: reviews || []
        };
    } catch (e) {
        console.warn("Lỗi fetch Profile Midman", e);
        return null;
    }
}
