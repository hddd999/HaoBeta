# 🍠 Ăn Tăng Cân

Website nhỏ để theo dõi chế độ ăn tăng cân. Bạn không cần đếm calo.

- **Thực đơn tự xoay vòng mỗi ngày**: 5 bữa (sáng, trưa, phụ chiều, tối, trước khi ngủ). Món vừa ăn sẽ "nghỉ" vài ngày. Trưa và tối không bao giờ trùng món và ưu tiên khác nguồn đạm.
- **Đổi món** cho từng bữa, đánh dấu **đã ăn**, xem **cách làm** từng món.
- **Thực đơn tuần** kèm **danh sách đi chợ** gộp sẵn số lượng và chi phí ước tính.
- **Ghi cân nặng**: biểu đồ, mục tiêu, tốc độ tăng (kg/tuần), dự đoán ngày đạt mục tiêu.
- **Tab Món ăn**: tắt những món không thích. Thực đơn sẽ tự xếp lại.

Dữ liệu được lưu trong trình duyệt (localStorage). Dùng nút **Xuất file / Nhập file** ở tab Cân nặng để sao lưu.

## Chạy thử trên máy

Đây là trang tĩnh (HTML/CSS/JS), không cần build.

```bash
npm run dev     # mở http://localhost:3000
npm test        # kiểm tra thuật toán xoay vòng
```

## Deploy lên Vercel

1. Vào https://vercel.com/new và chọn **Import** repo này từ GitHub.
2. Ở mục **Framework Preset**, chọn **Other**. Để trống Build Command, còn Output Directory để mặc định.
3. Bấm **Deploy**. Mỗi lần push lên GitHub, Vercel sẽ tự deploy lại.

Hoặc dùng CLI: `npx vercel` (lần đầu), rồi `npx vercel --prod`.

Cần một file HTML duy nhất (VD để đăng ở nơi chỉ nhận một file)? Chạy `npm run build:single` để có `dist/an-tang-can.html`.

## Thêm hoặc sửa món

Mở `js/dishes.js` và thêm một object vào `DISHES`:

- `pool` là bữa của món: `sang`, `chinh` (dùng cho cả trưa và tối), `phu` hoặc `khuya`.
- `ing` là nguyên liệu, mỗi dòng có dạng `[tên, số lượng, đơn vị]`. Phần này dùng để gộp thành danh sách đi chợ.
- `protein` dùng để trưa và tối không trùng nguồn đạm.

Thuật toán xoay vòng nằm ở `js/rotation.js`.
