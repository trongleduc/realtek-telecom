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
npm run build    # cần kết nối được MongoDB khi build
npm run start
```

Nội dung sửa trong trang quản trị hiển thị ngay, không cần build lại.

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
