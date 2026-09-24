# CMS (Payload) — hiện đang tắt

Website đang ở bản trình diễn giao diện: mọi dữ liệu lấy từ `src/demo/content.ts`, không cần database và không cần biến môi trường. Payload không được đóng gói vào bản build: không route nào của website import tới nó.

Mã CMS vẫn được giữ nguyên để bật lại:

| Thành phần | Vị trí |
|---|---|
| Cấu hình, collections, globals, phân quyền, hooks | `src/payload.config.ts`, `src/collections/`, `src/globals/`, `src/access/`, `src/hooks/`, `src/fields/`, `src/components/admin/` |
| Route admin + REST/GraphQL API | `src/cms/app/(payload)/` |
| Lớp dữ liệu đọc từ Payload | `src/cms/data.ts` (cùng tên hàm với `src/lib/data.ts`) |
| Lưu form liên hệ, đếm lượt tải tài liệu | `src/cms/contact.ts`, `src/cms/download.ts` |
| Xem bản nháp, làm mới cache cho script | `src/cms/routes/*.ts` |

## Bật lại CMS

1. Chuyển route admin về lại thư mục app: `git mv "src/cms/app/(payload)" "src/app/(payload)"`.
2. Đặt lại các route phụ:
   - `src/cms/routes/preview.ts` → `src/app/(frontend)/next/preview/route.ts`
   - `src/cms/routes/exit-preview.ts` → `src/app/(frontend)/next/exit-preview/route.ts`
   - `src/cms/routes/revalidate.ts` → `src/app/(frontend)/next/revalidate/route.ts`
3. Đổi nguồn dữ liệu:
   - `src/lib/data.ts`: `export * from '@/cms/data'`
   - `src/lib/contactStore.ts`: dùng `saveContact` trong `src/cms/contact.ts`
   - `src/lib/downloads.ts`: dùng `resolveDownload` trong `src/cms/download.ts`
4. `next.config.ts`: bọc lại cấu hình bằng `withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })`, bỏ `loader`/`loaderFile` của `images`.
5. `src/proxy.ts`: bỏ đoạn trả trang thông báo cho `/admin` và `/api`.
6. Khai báo biến môi trường (`DATABASE_URI`, `PAYLOAD_SECRET`, `R2_*`…) theo `.env.example`, chạy `npm run generate:importmap`, rồi `npm run seed` để nạp đúng nội dung mẫu đang hiển thị.
