/**
 * src/lib/supabase.ts
 * 
 * "CỔNG KẾT NỐI" HỆ THỐNG (System Connection)
 * ------------------------------------------
 * Đây là nơi Bím thiết lập "đường dây nóng" kết nối trực tiếp 
 * từ trình duyệt của bro đến Database Supabase.
 */
import { createClient } from '@supabase/supabase-js';

// Lấy thông tin URL và Key từ file bí mật (.env)
// Bím dùng `import.meta.env` để đảm bảo bảo mật, không lộ chìa khóa ra ngoài.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tạo ra một đối tượng `supabase` để cả dự án dùng chung để gọi dữ liệu
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Định nghĩa Email của Admin (để phân quyền ai là chủ shop, ai là khách)
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
