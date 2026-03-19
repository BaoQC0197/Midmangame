// src/types/account.ts

export type CategoryKey = 
    // Games
    | 'genshin' | 'honkai_star_rail' | 'zenless_zone_zero' | 'wuthering_waves' 
    // Social Media
    | 'facebook' | 'tiktok' | 'youtube' | 'instagram'
    // Entertainment & Learning
    | 'netflix' | 'spotify' | 'coursera' | 'premium_acc';

export interface TradeAccount {
    id: string;
    title: string;
    game: CategoryKey; // Reusing 'game' field for category
    server: string;
    price: number;
    description: string;
    thumbnail: string;
    images?: string[];
    is_sold: boolean;
    has_active_ticket?: boolean;
    seller_id?: string;
    category?: string; // e.g., 'Starter', 'Endgame', 'Whale'
    account_type?: string; // e.g., 'VIP', 'Rerolled', 'Ký gửi'
    promotion?: 'Hot' | 'Gợi ý' | 'None';
    created_at: string;
    sort_order?: number;
    seller_phone?: string;
    fee_payer?: 'seller' | 'buyer' | 'split';
    status?: 'pending' | 'approved' | 'rejected';
    hot_at?: string;
    hot_expires_at?: string;
    fee_discount?: number; // e.g. 0.5 for 50%
}

export type AccountInput = Omit<TradeAccount, 'id' | 'promotion' | 'created_at' | 'sort_order'>;

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
    genshin: 'Genshin Impact',
    honkai_star_rail: 'Honkai: Star Rail',
    zenless_zone_zero: 'Zenless Zone Zero',
    wuthering_waves: 'Wuthering Waves',
    facebook: 'Facebook',
    tiktok: 'Tiktok',
    youtube: 'Youtube',
    instagram: 'Instagram',
    netflix: 'Netflix',
    spotify: 'Spotify',
    coursera: 'Coursera',
    premium_acc: 'Tài khoản Premium khác',
};

export const CATEGORY_STRUCTURE = [
    {
        id: 'game',
        label: 'Game',
        icon: '/src/assets/categories/game.png',
        items: ['genshin', 'honkai_star_rail', 'zenless_zone_zero', 'wuthering_waves'] as CategoryKey[]
    },
    {
        id: 'social',
        label: 'Mạng xã hội',
        icon: '/src/assets/categories/social.png',
        items: ['facebook', 'tiktok', 'youtube', 'instagram'] as CategoryKey[]
    },
    {
        id: 'entertainment',
        label: 'Dịch vụ',
        icon: '/src/assets/categories/service.png',
        items: ['netflix', 'spotify', 'coursera', 'premium_acc'] as CategoryKey[]
    }
];
