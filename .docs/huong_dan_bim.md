# 🗺️ Bím Hướng dẫn: Hiểu cơ chế vận hành từ A -> Z

Chào bro! Đừng để số lượng file làm bro rối mắt. **Bím** đã soạn sẵn bản đồ này để bro luôn biết mình đang đứng ở đâu và cần đi đâu.

---

## 📂 1. Cấu trúc thư mục (Tổng quan)

| Thư mục | Ý nghĩa | Khi nào cần vào đây? |
| :--- | :--- | :--- |
| `src/api` | Các file gọi dữ liệu từ Database (Supabase). | Khi muốn thay đổi cách lấy dữ liệu hoặc thêm bảng mới. |
| `src/components` | Các mảnh ghép giao diện (UI). | Khi muốn sửa giao diện (HTML/CSS) của một phần cụ thể. |
| `src/hooks` | "Bộ não" xử lý logic. | Khi muốn sửa cách hoạt động (ví dụ: bấm nút này thì chuyện gì xảy ra). |
| `src/lib` | Cấu hình thư viện (Supabase). | Chỉ vào đây khi cần đổi tài khoản Supabase hoặc EmailJS. |
| `src/styles` | Chứa CSS dùng chung cho toàn bộ web. | Khi muốn đổi màu chủ đạo, font chữ cho cả trang. |
| `src/types` | Định nghĩa tên các trường dữ liệu. | Khi muốn thêm một trường mới (ví dụ: SP có thêm màu sắc). |

---

## 🎯 2. Tìm nhanh theo tính năng (Mục tiêu của bro)

### 🧺 Quản lý Sản phẩm
- **Giao diện danh sách:** `components/ProductList.tsx` & `.module.css` - Nơi render vòng lặp để hiện tất cả các thẻ sản phẩm.
- **Từng thẻ sản phẩm:** `components/ProductCard.tsx` & `.module.css` - Nơi quy định cái khung, cái ảnh, cái giá của 1 sản phẩm trông như thế nào.
- **Xem chi tiết sản phẩm:** `components/ProductDetailModal.tsx` & `.module.css` - Cái bảng hiện ra khi bro click vào xem chi tiết, có nút "Mua ngay".
- **Logic lấy sản phẩm:** `api/products.ts` (Hỏi DB) & `hooks/useVppData.ts` (Nhớ dữ liệu).

### 🛒 Giỏ hàng & Đặt hàng
- **Giao diện giỏ hàng:** `components/CartDrawer.tsx` & `.module.css` - Cái thanh trượt từ bên phải ra khi bro xem giỏ.
- **Logic tính tiền/thêm bớt:** `hooks/useCart.ts` - Nơi tính tổng tiền và xử lý khi bro nhấn dấu + hoặc -.
- **Form điền thông tin đặt hàng:** `components/OrderModal.tsx` & `.module.css` - Nơi bro nhập tên, SĐT và địa chỉ.
- **Gửi đơn hàng lên DB:** `api/orders.ts` - Hàm `createOrder` sẽ đẩy dữ liệu lên bảng `orders` của Supabase.

### 👤 Khu vực Admin (Quản trị)
- **Bảng điều khiển Admin:** `components/AdminDashboard.tsx` & `.module.css` - Nơi Admin quản lý toàn bộ.
- **Thêm/Sửa sản phẩm:** `components/EditModal.tsx` & `components/MultiImageUpload.tsx` - Các form để nhập liệu.

---

## 🔄 3. Cơ chế "Dòng chảy dữ liệu" (Detailed Flow)

Để hiểu bản chất, bro hãy nhìn cách một thông tin (ví dụ: Tên sản phẩm) đi qua các tầng:

1. **BƯỚC 1: LẤY DỮ LIỆU (fetching)**
   - File `api/products.ts` dùng lệnh `supabase.from('products').select('*')` để lấy dữ liệu từ server về.

2. **BƯỚC 2: GHI NHỚ (Storing)**
   - Custom Hook `useVppData.ts` gọi hàm lấy dữ liệu đó và cất vào một cái "hộp" gọi là `useState`. 
   - Cái hộp này sẽ giữ dữ liệu cho đến khi bro tắt web.

3. **BƯỚC 3: PHÂN PHỐI (Passing Props)**
   - Trong `App.tsx`, Bím lấy dữ liệu từ cái hộp đó ra và đưa cho `ProductList`: `<ProductList products={products} />`.
   - Lưu ý: Dữ liệu truyền từ Cha (`App.tsx`) xuống Con (`ProductList`) được gọi là **Props**.

4. **BƯỚC 4: HIỂN THỊ (Rendering)**
   - `ProductList` dùng hàm `.map()` để lặp qua danh sách và vẽ ra từng cái `ProductCard`.

---

## 🎨 4. Quy tắc Sửa CSS (Giao diện)

Dự án sử dụng **CSS Modules**. Đây là kiểu CSS "không đụng hàng":
- Nếu sửa trong `Header.module.css`, nó chỉ ảnh hưởng đúng cái `Header`. 
- **Cách sửa:** Bro tìm file `.module.css` tương ứng với phần muốn sửa. Ví dụ muốn giao diện SP đẹp hơn thì vào `ProductCard.module.css`.

---

## 💡 5. Cách Bím giúp bro học tốt nhất
- **Tập đọc Component**: Mở một file trong `components`, tìm phần nằm trong `return (...)`. Đó là cấu trúc HTML (JSX). Đọc nó bro sẽ biết phần đó có những cái nút hay cái ảnh nào.
- **Tập đọc Logic**: Tìm các hàm bắt đầu bằng `const handle...`. Đó là những hành động xảy ra khi có sự kiện (click, nhập liệu).
- **Thử sai**: Đừng sợ hỏng, Bím có quy tắc **Revert** rồi. Bro cứ sửa thử, nếu lỗi Bím sẽ chỉ bro cách quay lại!

**Bím** luôn ở đây. Đừng ngần ngại hỏi bất kỳ dòng code nào bro thấy "lạ lẫm"! 🫡✨🤝
