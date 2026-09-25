# CMS (Payload)

Website đọc dữ liệu từ MongoDB qua Payload. Trang quản trị ở `/admin`.

| Thành phần                                        | Vị trí                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Cấu hình, collections, globals, phân quyền, hooks | `src/payload.config.ts`, `src/collections/`, `src/globals/`, `src/access/`, `src/hooks/`, `src/fields/`, `src/components/admin/` |
| Route admin + REST/GraphQL API                    | `src/app/(payload)/`                                                                                                             |
| Lớp dữ liệu đọc từ Payload                        | `src/cms/data.ts` (được `src/lib/data.ts` re-export)                                                                             |
| Lưu form liên hệ, đếm lượt tải tài liệu           | `src/cms/contact.ts`, `src/cms/download.ts` (qua `src/lib/contactStore.ts`, `src/lib/downloads.ts`)                              |
| Xem bản nháp, làm mới cache cho script            | `src/app/(frontend)/next/{preview,exit-preview,revalidate}/route.ts`                                                             |

## Khởi tạo

1. Khai báo biến môi trường theo `.env.example` (bắt buộc: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`).
2. `npm run seed` để nạp nội dung mẫu (`-- --force` xoá nội dung cũ rồi nạp lại).
3. `npm run create-user -- --email=… --role=admin` để tạo tài khoản quản trị.

Không có `R2_BUCKET` thì ảnh upload được lưu ở thư mục `media/` trên máy. Khi bật R2 sau khi đã có dữ liệu, các file cũ
không tự chuyển lên R2: upload lại (hoặc `npm run seed -- --force` nếu vẫn là dữ liệu mẫu).

## Chạy bản trình diễn không cần database

`src/demo/provider.ts` có cùng các hàm với `src/cms/data.ts` và đọc từ `src/demo/content.ts`. Để dùng nó: cho
`src/lib/data.ts` re-export `@/demo/provider`, chuyển `src/app/(payload)` ra khỏi `src/app`, bỏ `withPayload` trong
`next.config.ts`, thêm `images.unsplash.com` vào `images.remotePatterns` (ảnh demo lấy từ Unsplash), và cho
`contactStore.ts`/`downloads.ts` không import `src/cms/*`.
