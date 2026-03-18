// src/types/ticket.ts

export type TicketStatus =
    | 'pending_review'  // Người bán vừa đăng, chờ admin duyệt
    | 'listed'          // Acc đã lên sàn
    | 'pending_match'   // Có người mua đặt yêu cầu
    | 'matched'         // Admin đã ghép đôi
    | 'trading'         // Đang giao dịch (có room Jitsi)
    | 'completed'       // Hoàn thành
    | 'disputed'        // Tranh chấp
    | 'cancelled';      // Đã hủy

export interface TicketChecklist {
    identity_verified: boolean;      // Đã xác minh danh tính 2 bên
    buyer_paid: boolean;             // Người mua đã chuyển tiền trung gian
    seller_delivered: boolean;        // Người bán đã bàn giao account
    buyer_confirmed: boolean;        // Người mua đã đổi pass/ xác nhận
    seller_received_payment: boolean; // Đã giải ngân cho người bán
    
    // Trade Machine States (PokeBall Visuals)
    seller_exported?: boolean;       // Quả cầu xuất hiện bên Seller
    seller_verified?: boolean;       // Quả cầu Seller đổi màu (đã nhận thông tin)
    buyer_exported?: boolean;        // Quả cầu xuất hiện bên Buyer
    buyer_verified?: boolean;        // Quả cầu Buyer đổi màu (đã nhận tiền)
}

export interface TicketAudit {
    timestamp: string;
    action: string;
    details?: string;
    admin_id?: string;
}

export interface TransactionTicket {
    id: string;
    account_id: string;
    // Thông tin tài khoản (join từ trade_accounts)
    account_title?: string;
    account_price?: number;
    account_game?: string;
    // Người liên quan
    buyer_contact: string;
    buyer_phone?: string;
    buyer_user_id?: string;
    seller_contact?: string;
    seller_phone?: string;
    seller_user_id?: string;
    // Giao dịch
    price: number;
    fee: number;
    status: TicketStatus;
    note?: string;
    admin_notes?: string;
    // Phòng giao dịch Jitsi
    room_url?: string;
    // Checklist và Audit Log
    checklist?: TicketChecklist;
    audit_log?: TicketAudit[];
    // Timestamps vòng đời
    matched_at?: string;
    trading_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateTicketPayload {
    account_id: string;
    buyer_phone: string;
    buyer_user_id?: string;
    note?: string;
    midman_id?: string;
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    pending_review: 'Chờ duyệt',
    listed: 'Đã đăng sàn',
    pending_match: 'Chờ ghép đôi',
    matched: 'Đã ghép đôi',
    trading: '🔴 Đang giao dịch',
    completed: '✅ Hoàn thành',
    disputed: '⚠️ Tranh chấp',
    cancelled: 'Đã hủy',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
    pending_review: '#6b7280',
    listed: '#3b82f6',
    pending_match: '#f59e0b',
    matched: '#8b5cf6',
    trading: '#ef4444',
    completed: '#10b981',
    disputed: '#f97316',
    cancelled: '#374151',
};

// Bước tiếp theo hợp lệ trong pipeline
export const TICKET_NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus[]>> = {
    pending_review: ['listed', 'cancelled'],
    listed: ['pending_match', 'cancelled'],
    pending_match: ['matched', 'cancelled'],
    matched: ['trading', 'cancelled'],
    trading: ['completed', 'disputed'],
    disputed: ['completed', 'cancelled'],
};
