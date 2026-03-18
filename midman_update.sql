-- Thêm các cột mới vào bảng midman_applications
ALTER TABLE public.midman_applications
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS cccd_front_url TEXT,
ADD COLUMN IF NOT EXISTS cccd_back_url TEXT,
ADD COLUMN IF NOT EXISTS fee_rate TEXT,
ADD COLUMN IF NOT EXISTS working_hours TEXT;

-- (Tuỳ chọn) Cập nhật cccd hiện có:
-- Lệnh này đổi tên cột từ cdcd thành cccd nếu bạn đang dùng cdcd
-- ALTER TABLE public.midman_applications RENAME COLUMN cdcd TO cccd;

-- Thêm midman_id vào transaction_tickets để gán vé giao dịch cho tài khoản Midman phụ trách
ALTER TABLE public.transaction_tickets
ADD COLUMN IF NOT EXISTS midman_id UUID REFERENCES auth.users(id);

-- Thêm ảnh đại diện chân dung cho Midman
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Bảng đánh giá của người dùng dành cho Midman
CREATE TABLE IF NOT EXISTS public.midman_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    midman_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bảng chat nội bộ 3 bên (Người Mua - Người Bán - Midman)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.transaction_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'seller', 'midman', 'system')),
    sender_name TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index nhanh cho query theo ticket
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

-- Bật Realtime cho bảng ticket_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
