-- Xóa bảng cũ nếu tồn tại để tránh lỗi lệch schema
DROP TABLE IF EXISTS public.categories CASCADE;

-- SQL to create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    group_label TEXT NOT NULL,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bật RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép mọi người đọc (Public Read)
CREATE POLICY "Allow public read" ON public.categories FOR SELECT USING (true);

-- Policy: Cho phép Admin/Authenticated người dùng ghi (Authenticated Write)
-- Lưu ý: Thực tế nên check email/role, nhưng để test thì cho phép authenticated
CREATE POLICY "Allow authenticated upsert" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete" ON public.categories FOR DELETE USING (true);

-- Bật Realtime cho bảng categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- Insert initial data with icon_url
INSERT INTO public.categories (id, name, group_id, group_label, icon_url, sort_order) VALUES
('genshin', 'Genshin Impact', 'game', 'Game', '/src/assets/categories/genshin.png', 1),
('honkai_star_rail', 'Honkai: Star Rail', 'game', 'Game', '/src/assets/categories/honkai.png', 2),
('zenless_zone_zero', 'Zenless Zone Zero', 'game', 'Game', '/src/assets/categories/game.png', 3),
('wuthering_waves', 'Wuthering Waves', 'game', 'Game', '/src/assets/categories/game.png', 4),
('facebook', 'Facebook', 'social', 'Mạng xã hội', '/src/assets/categories/social.png', 5),
('tiktok', 'Tiktok', 'social', 'Mạng xã hội', '/src/assets/categories/social.png', 6),
('youtube', 'Youtube', 'social', 'Mạng xã hội', '/src/assets/categories/social.png', 7),
('instagram', 'Instagram', 'social', 'Mạng xã hội', '/src/assets/categories/social.png', 8),
('netflix', 'Netflix', 'entertainment', 'Dịch vụ', '/src/assets/categories/service.png', 9),
('spotify', 'Spotify', 'entertainment', 'Dịch vụ', '/src/assets/categories/service.png', 10),
('coursera', 'Coursera', 'entertainment', 'Dịch vụ', '/src/assets/categories/service.png', 11),
('premium_acc', 'Tài khoản Premium khác', 'entertainment', 'Dịch vụ', '/src/assets/categories/service.png', 12)
ON CONFLICT (id) DO UPDATE SET 
    icon_url = EXCLUDED.icon_url,
    group_label = EXCLUDED.group_label;
