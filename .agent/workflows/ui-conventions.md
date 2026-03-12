---
description: Quy chuẩn và Lưu ý quan trọng khi làm UI/CSS cho dự án Midman (GachaTrade)
---

# 🚨 LƯU Ý SỐNG CÒN KHI CODE UI / CSS CHO GACHATRADE

Dự án này rất đề cao tính Thẩm mỹ và Độ Premium, độ hoàn thiện (Pixel-perfect), nên ở các yêu cầu thêm/sửa UI, bạn (AI) bắt buộc tuân thủ 3 nguyên tắc sau trước khi Code:

## 1. QUY CHUẨN CONTAINER & SPACING
- **LUÔN DÙNG `.container` class**: Tất cả các khối nằm trong `Header`, phần thân `Main`, và dưới `Footer` tuyệt đối phải được bọc trong class `.container` để giới hạn chiều rộng max (`1400px`) và luôn có Padding lề 2 bên (`40px` cho Desktop / `20px` cho Mobile).
- **Tuyệt đối không** để các Content Box bị thả trôi dính sát mép màn hình PC vì nó sẽ tạo cảm giác web rẻ tiền.

## 2. QUY CHUẨN RESPONSIVE MOBILE (< 1024px & < 640px)
- **Nút bấm / Label**: Tại Mobile, các khối chữ trong nút bấm thường bị co hẹp dẫn đến rơi chữ xuống 2-3 dòng làm vỡ form. LUÔN thêm `white-space: nowrap;` và `flex-shrink: 0;` cho Button trong các khối Flexbox.
- **Canh lề các Card / Stats**: Thay vì dùng `inline-flex` làm lệch toàn màn hình hoặc dãn không đều, hãy gom chúng lại thành 1 cục Block Container có `display: flex; flex-direction: column; width: fit-content; margin: 0 auto;` để tự động căn giữa mà vẫn giữ icon sát lề trái đồng nhất.
- **Hero / Form Element**: Chú ý chữ không được cài `display: block` cứng mà nên dùng `inline-block` để duy trì mạch văn tự nhiên khi thu nhỏ trình duyệt.

## 3. CHECKLIST TRƯỚC KHI BÁO CÁO NHIỆM VỤ UI
- [ ] CSS của Component này đã tương thích màn Mobile (<640px) chưa? (Bằng các query `@media`)
- [ ] Có Component nào đang nằm ngoài Wrapper `.container` không? 
- [ ] Ảnh bìa / Avatar / Form Inpput có bị co giãn (hư aspect-ratio) hay rớt chữ vì thiếu width không?

=> Nếu hoàn thành bài toán nào đụng tới CSS / Tái cấu trúc, vui lòng check file này đầu tiên!
