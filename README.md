# Website Realtek Telecom

Website giới thiệu doanh nghiệp và thư viện tài liệu trung gian của Công ty Cổ phần Tin học Viễn thông Realtek. Đặc tả yêu cầu và kế hoạch: [docs/SRS.md](docs/SRS.md).

- Next.js 16 (App Router) + Payload CMS 3 (trang quản trị tại `/admin`)
- MongoDB, Cloudflare R2 (lưu ảnh), 3 ngôn ngữ: Tiếng Việt (mặc định), English, 中文

## Cài đặt

Yêu cầu: Node.js ≥ 20.9, MongoDB.

```bash
npm install
cp .env.example .env      # điền DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SITE_URL…
npm run dev               # http://localhost:3000 — quản trị: http://localhost:3000/admin
```

Lần đầu mở `/admin`, hệ thống yêu cầu tạo tài khoản đầu tiên (tự động là Quản trị viên). Hoặc tạo bằng lệnh:

```bash
npm run create-user -- --email=ten@realtek.vn --name="Nguyễn Văn A" --role=admin
```

Dữ liệu mẫu để xem trước giao diện (ảnh Unsplash, nội dung giả định — thay bằng nội dung thật trước khi chạy chính thức):

```bash
npm run seed              # chỉ chạy khi chưa có dữ liệu
npm run seed -- --force   # xoá nội dung cũ rồi seed lại (giữ tài khoản và liên hệ)
```

## Biến môi trường

Xem [.env.example](.env.example). Tối thiểu cần `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`.

| Nhóm | Ghi chú |
|---|---|
| `R2_*` | Để trống `R2_BUCKET` thì ảnh lưu trên ổ đĩa (`/media`), chỉ nên dùng khi phát triển. `R2_PUBLIC_URL` là domain công khai của bucket. |
| `SMTP_*` | Gửi email báo liên hệ mới. Không cấu hình thì email chỉ ghi ra log. Địa chỉ nhận đặt trong Cấu hình chung → Thông báo & CRM. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile cho form liên hệ (tuỳ chọn). |
| `ALTERNATE_HOSTS` | Các tên miền phụ chuyển hướng 301 về tên miền chính. |

## Build và chạy production

```bash
npm run build    # không cần kết nối database khi build
npm run start
```

Nội dung sửa trong trang quản trị hiển thị ngay, không cần build lại. Các trang được dựng ở lần truy cập đầu tiên rồi lưu cache.

## Deploy lên Vercel

1. **MongoDB Atlas** (hoặc MongoDB khác truy cập được từ Internet): lấy chuỗi kết nối `mongodb+srv://…`, và trong *Network Access* cho phép `0.0.0.0/0` (Vercel không có IP cố định).
2. **Cloudflare R2** là bắt buộc: Vercel không lưu được file tải lên ổ đĩa. Tạo bucket, bật truy cập công khai (hoặc gắn domain riêng) và điền các biến `R2_*`.
3. Trong *Vercel → Project → Settings → Environment Variables* (môi trường Production, và Preview nếu dùng), khai báo ít nhất:
   - `DATABASE_URI` — chuỗi kết nối Atlas, **không phải** `127.0.0.1`
   - `PAYLOAD_SECRET`
   - `NEXT_PUBLIC_SITE_URL` — ví dụ `https://realtektelecom.com` (để trống thì dùng domain production của Vercel)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
   - tuỳ chọn: `SMTP_*`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `ALTERNATE_HOSTS`
4. Deploy lại. Ảnh đã upload khi chạy trên máy (thư mục `/media`) không tự chuyển lên R2: cần upload lại trong trang quản trị, hoặc chạy `npm run seed -- --force` trên máy với `.env` trỏ tới Atlas và R2.

Lưu ý: giới hạn số lần gửi form liên hệ đang lưu trong bộ nhớ, nên trên Vercel mỗi instance đếm riêng. Turnstile vẫn chặn spam bình thường.

## Sao lưu

`npm run backup` chạy `mongodump`, nén và tải lên bucket `R2_BACKUP_BUCKET`, giữ 30 bản gần nhất. Cần cài MongoDB Database Tools. Lịch chạy hằng ngày (cron):

```
0 2 * * * cd /srv/realtek-telecom && npm run backup >> /var/log/realtek-backup.log 2>&1
```

Khôi phục: tải bản sao lưu về rồi chạy `mongorestore --uri="$DATABASE_URI" --gzip --archive=<file> --drop`.

## Lệnh khác

| Lệnh | Mục đích |
|---|---|
| `npm run lint` / `npm run typecheck` | Kiểm tra mã nguồn |
| `npm run generate:types` | Sinh lại `src/payload-types.ts` sau khi sửa collection/global |
| `npm run generate:importmap` | Sinh lại import map khi thêm component tuỳ biến cho admin |
