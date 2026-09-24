/**
 * Placeholder content shared by demo mode (site runs without a database, see src/demo/provider.ts)
 * and by scripts/seed.ts (loads the same content into Payload).
 *
 * Company details come from the contract; everything else (texts, figures, projects, documents,
 * partner names, Unsplash photos) is placeholder to be replaced by Realtek's real content.
 *
 * Conventions: a `{ vi, en, zh }` object is a localized value; `photo('key')` references an entry of `photos`.
 * Rich text is Vietnamese only (other locales fall back to it, as Payload does).
 */

export type L = { vi: string; en: string; zh: string }
export type PhotoRef = { $photo: PhotoKey }

/* ---------- Lexical rich text helpers ---------- */

const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
const p = (t: string) => ({ type: 'paragraph', children: [text(t)], textFormat: 0, ...block })
const h = (t: string, tag: 'h2' | 'h3' = 'h2') => ({ type: 'heading', tag, children: [text(t)], ...block })
const ul = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((t, i) => ({ type: 'listitem', value: i + 1, children: [text(t)], ...block })),
  ...block,
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RichDoc = any
const doc = (...children: object[]): RichDoc => ({ root: { type: 'root', children, ...block } })

/* ---------- Photos (free Unsplash licence; Asian people and Vietnamese cities) ---------- */

export const photos = {
  earth: '1451187580459-43490279c0fa',
  skylineHcmc: '1749580869357-64f04a4dc48f',
  skylineFlowers: '1740540595751-077e773ae950',
  daNang: '1558002890-c0b30998d1e6',
  cityNight: '1509964199763-e8c2f6549853',
  meeting: '1601513042740-3f9041642307',
  teamGroup: '1601513043334-36a0088140d4',
  teamTable: '1754531976828-69e42ce4e0d9',
  womenTeam: '1650784853603-bd1ee8fb6712',
  officeTeam: '1766066014773-0074bf4911de',
  womanPortrait: '1573496799652-408c2ac9fe98',
  whiteboard: '1573166364524-d9dbfd8bbf83',
  analyst: '1738566061688-47e66a008254',
  officeDesk: '1783538771515-78a987fcdbbf',
  womanMonitors: '1558949623-35b2e2649754',
  techPanel: '1786840320410-a7bec09c393c',
  techHelmet: '1613620838744-a0fbfb76bae3',
  facilityEngineer: '1700727448575-6f1680cd7d75',
  electronicsBench: '1755053757758-e06b6593a320',
  womanEngineer: '1685475896056-8f5c6fb7e8a7',
  itSupport: '1558698972-c50e325e6799',
}
export type PhotoKey = keyof typeof photos
export const photo = (key: PhotoKey): PhotoRef => ({ $photo: key })

export const photoAlts: Record<PhotoKey, L> = {
  earth: {
    vi: 'Mạng lưới kết nối toàn cầu nhìn từ không gian',
    en: 'Global connectivity seen from space',
    zh: '从太空俯瞰全球网络',
  },
  skylineHcmc: {
    vi: 'Toàn cảnh TP. Hồ Chí Minh lúc hoàng hôn',
    en: 'Ho Chi Minh City skyline at sunset',
    zh: '日落时分的胡志明市天际线',
  },
  skylineFlowers: {
    vi: 'Các tòa nhà cao tầng tại TP. Hồ Chí Minh',
    en: 'High-rise towers in Ho Chi Minh City',
    zh: '胡志明市高楼',
  },
  daNang: { vi: 'Cầu Rồng và thành phố Đà Nẵng', en: 'Dragon Bridge and Da Nang city', zh: '岘港龙桥与城市' },
  cityNight: { vi: 'Thành phố về đêm', en: 'City at night', zh: '城市夜景' },
  meeting: { vi: 'Đội ngũ họp bàn dự án', en: 'Team meeting on a project', zh: '团队项目会议' },
  teamGroup: { vi: 'Đội ngũ nhân sự trẻ', en: 'Our young team', zh: '年轻的团队' },
  teamTable: { vi: 'Họp cùng đối tác doanh nghiệp', en: 'Meeting with business partners', zh: '与企业伙伴会谈' },
  womenTeam: { vi: 'Ban lãnh đạo gặp gỡ khách hàng', en: 'Management meeting clients', zh: '管理层与客户会面' },
  officeTeam: {
    vi: 'Nhân viên trao đổi công việc tại văn phòng',
    en: 'Colleagues working together in the office',
    zh: '同事在办公室协作',
  },
  womanPortrait: {
    vi: 'Kỹ sư công nghệ tại văn phòng',
    en: 'Technology engineer in the office',
    zh: '办公室里的技术工程师',
  },
  whiteboard: {
    vi: 'Kỹ sư trình bày giải pháp trên bảng',
    en: 'Engineer sketching a solution on a whiteboard',
    zh: '工程师在白板上讲解方案',
  },
  analyst: {
    vi: 'Chuyên viên phân tích số liệu hệ thống',
    en: 'Analyst reviewing system data',
    zh: '分析师查看系统数据',
  },
  officeDesk: {
    vi: 'Nhân viên làm việc với hệ thống IT',
    en: 'Staff working on the IT system',
    zh: '员工使用 IT 系统',
  },
  womanMonitors: {
    vi: 'Lập trình viên làm việc với nhiều màn hình',
    en: 'Developer working across monitors',
    zh: '开发人员使用多台显示器工作',
  },
  techPanel: {
    vi: 'Kỹ sư kiểm tra linh kiện điện tử',
    en: 'Engineer testing electronic components',
    zh: '工程师测试电子元件',
  },
  techHelmet: { vi: 'Kỹ thuật viên thi công tại hiện trường', en: 'Field technician at work', zh: '现场施工技术人员' },
  facilityEngineer: {
    vi: 'Kỹ sư kiểm tra hệ thống kỹ thuật',
    en: 'Engineer inspecting technical systems',
    zh: '工程师检查技术系统',
  },
  electronicsBench: {
    vi: 'Kỹ thuật viên sửa chữa thiết bị',
    en: 'Technician servicing equipment',
    zh: '技术人员维修设备',
  },
  womanEngineer: { vi: 'Kỹ sư vận hành phòng thiết bị', en: 'Engineer in the equipment room', zh: '设备间里的工程师' },
  itSupport: {
    vi: 'Nhân viên giám sát hệ thống máy tính',
    en: 'Staff monitoring computer systems',
    zh: '员工监控计算机系统',
  },
}

/* ---------- Categories ---------- */

export const postCategories = [
  { slug: 'company-news', title: { vi: 'Tin công ty', en: 'Company news', zh: '公司新闻' } },
  { slug: 'technology', title: { vi: 'Công nghệ', en: 'Technology', zh: '技术' } },
  { slug: 'events', title: { vi: 'Sự kiện', en: 'Events', zh: '活动' } },
]

export const documentCategories = [
  { slug: 'company-profile', title: { vi: 'Hồ sơ năng lực', en: 'Company profile', zh: '公司简介' } },
  { slug: 'technical-documents', title: { vi: 'Tài liệu kỹ thuật', en: 'Technical documents', zh: '技术资料' } },
  { slug: 'catalogues', title: { vi: 'Catalogue thiết bị', en: 'Equipment catalogues', zh: '设备目录' } },
  { slug: 'forms', title: { vi: 'Biểu mẫu', en: 'Forms', zh: '表格' } },
]

/* ---------- Services ---------- */

const serviceBody = (intro: string) =>
  doc(
    p(intro),
    h('Phạm vi triển khai'),
    ul([
      'Khảo sát hiện trạng và tư vấn giải pháp',
      'Thiết kế, cung cấp và lắp đặt thiết bị',
      'Cấu hình, kiểm thử và bàn giao',
      'Bảo trì, hỗ trợ kỹ thuật sau triển khai',
    ]),
    h('Quy trình làm việc'),
    p(
      'Đội ngũ kỹ sư của Realtek làm việc trực tiếp với khách hàng từ bước khảo sát đến vận hành, bảo đảm hệ thống đáp ứng đúng nhu cầu và có khả năng mở rộng về sau.',
    ),
  )

const serviceGallery = [photo('teamGroup'), photo('womanEngineer'), photo('womanPortrait')]

export const services = [
  {
    slug: 'network-infrastructure',
    featuredImage: photo('techPanel'),
    title: { vi: 'Hạ tầng mạng doanh nghiệp', en: 'Enterprise network infrastructure', zh: '企业网络基础设施' },
    excerpt: {
      vi: 'Thiết kế và thi công hệ thống mạng LAN, WAN, Wi-Fi cho văn phòng, nhà xưởng và tòa nhà.',
      en: 'Design and deployment of LAN, WAN and Wi-Fi for offices, factories and buildings.',
      zh: '为办公室、厂房和楼宇设计并部署局域网、广域网及无线网络。',
    },
  },
  {
    slug: 'fiber-optic-telecom',
    featuredImage: photo('techHelmet'),
    title: { vi: 'Cáp quang & viễn thông', en: 'Fiber optics & telecom', zh: '光纤与电信' },
    excerpt: {
      vi: 'Thi công tuyến cáp quang, hệ thống tổng đài và kết nối viễn thông ổn định cho doanh nghiệp.',
      en: 'Fiber routes, PBX systems and reliable telecom links for businesses.',
      zh: '为企业建设光纤线路、交换机系统及稳定的通信连接。',
    },
  },
  {
    slug: 'data-center',
    featuredImage: photo('facilityEngineer'),
    title: { vi: 'Trung tâm dữ liệu', en: 'Data center solutions', zh: '数据中心解决方案' },
    excerpt: {
      vi: 'Tư vấn, xây dựng phòng máy chủ và trung tâm dữ liệu đạt chuẩn, vận hành liên tục.',
      en: 'Planning and building standard-compliant server rooms and data centers.',
      zh: '规划并建设符合标准、持续运行的机房与数据中心。',
    },
  },
  {
    slug: 'cybersecurity',
    featuredImage: photo('itSupport'),
    title: { vi: 'Bảo mật hệ thống', en: 'Cybersecurity', zh: '网络安全' },
    excerpt: {
      vi: 'Tường lửa, kiểm soát truy cập và giám sát an ninh mạng cho hệ thống doanh nghiệp.',
      en: 'Firewalls, access control and security monitoring for business systems.',
      zh: '为企业系统提供防火墙、访问控制与安全监控。',
    },
  },
  {
    slug: 'managed-it-services',
    featuredImage: photo('electronicsBench'),
    title: { vi: 'Dịch vụ CNTT trọn gói', en: 'Managed IT services', zh: 'IT 托管服务' },
    excerpt: {
      vi: 'Vận hành, bảo trì và hỗ trợ kỹ thuật định kỳ để hệ thống luôn sẵn sàng.',
      en: 'Operation, maintenance and scheduled support that keep systems running.',
      zh: '定期运维、保养与技术支持，确保系统随时可用。',
    },
  },
  {
    slug: 'software-solutions',
    featuredImage: photo('womanMonitors'),
    featured: false,
    title: { vi: 'Giải pháp phần mềm', en: 'Software solutions', zh: '软件解决方案' },
    excerpt: {
      vi: 'Triển khai phần mềm quản trị, tích hợp hệ thống theo quy trình của từng doanh nghiệp.',
      en: 'Business software and system integration tailored to each workflow.',
      zh: '根据企业流程实施管理软件与系统集成。',
    },
  },
].map((s, i) => ({
  ...s,
  order: i + 1,
  featured: s.featured ?? true,
  gallery: serviceGallery,
  content: serviceBody(s.excerpt.vi),
}))

/* ---------- Projects ---------- */

const projectBody = doc(
  p('Nội dung mẫu. Bên A thay bằng mô tả thực tế của dự án trong trang quản trị.'),
  h('Thách thức'),
  p('Hệ thống cũ không đáp ứng được nhu cầu mở rộng, thiếu khả năng giám sát tập trung và dự phòng.'),
  h('Giải pháp'),
  ul([
    'Thiết kế lại sơ đồ mạng theo mô hình phân lớp',
    'Chuẩn hoá tủ rack, đi dây và dán nhãn',
    'Triển khai giám sát tập trung và cảnh báo',
  ]),
  h('Kết quả'),
  p('Hệ thống vận hành ổn định, dễ mở rộng và giảm thời gian xử lý sự cố.'),
)

export const projects = [
  {
    slug: 'office-tower-network',
    featuredImage: photo('skylineHcmc'),
    year: 2024,
    title: { vi: 'Mạng tòa văn phòng', en: 'Office Tower Network', zh: '写字楼网络' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市' },
    field: { vi: 'Hạ tầng mạng', en: 'Networking', zh: '网络' },
  },
  {
    slug: 'data-center-upgrade',
    featuredImage: photo('womanEngineer'),
    year: 2025,
    title: { vi: 'Nâng cấp trung tâm dữ liệu', en: 'Data Center Upgrade', zh: '数据中心升级' },
    location: { vi: 'Bình Dương', en: 'Binh Duong', zh: '平阳' },
    field: { vi: 'Trung tâm dữ liệu', en: 'Data center', zh: '数据中心' },
  },
  {
    slug: 'campus-wifi',
    featuredImage: photo('officeTeam'),
    year: 2023,
    title: { vi: 'Wi-Fi khuôn viên', en: 'Campus Wi-Fi', zh: '园区无线网络' },
    location: { vi: 'Hà Nội', en: 'Hanoi', zh: '河内' },
    field: { vi: 'Không dây', en: 'Wireless', zh: '无线' },
  },
  {
    slug: 'fiber-backbone',
    featuredImage: photo('cityNight'),
    year: 2024,
    title: { vi: 'Tuyến cáp quang trục', en: 'Fiber Backbone', zh: '光纤骨干网' },
    location: { vi: 'Đồng Nai', en: 'Dong Nai', zh: '同奈' },
    field: { vi: 'Cáp quang', en: 'Fiber optics', zh: '光纤' },
  },
  {
    slug: 'smart-office',
    featuredImage: photo('daNang'),
    year: 2025,
    title: { vi: 'Văn phòng thông minh', en: 'Smart Office', zh: '智能办公室' },
    location: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港' },
    field: { vi: 'Tích hợp hệ thống', en: 'System integration', zh: '系统集成' },
  },
  {
    slug: 'headquarters-it-system',
    featuredImage: photo('officeDesk'),
    year: 2022,
    title: { vi: 'Hệ thống IT trụ sở', en: 'Headquarters IT', zh: '总部 IT 系统' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市' },
    field: { vi: 'Dịch vụ CNTT', en: 'Managed IT', zh: 'IT 服务' },
  },
].map((pr, i) => ({
  ...pr,
  order: i,
  featured: true,
  gallery: [photo('facilityEngineer'), photo('techPanel'), photo('electronicsBench'), photo('techHelmet')],
  client: { vi: 'Khách hàng doanh nghiệp', en: 'Enterprise client', zh: '企业客户' },
  excerpt: {
    vi: `Dự án ${pr.title.vi.toLowerCase()} được Realtek khảo sát, thiết kế và triển khai trọn gói, đưa vào vận hành đúng tiến độ.`,
    en: `Realtek surveyed, designed and delivered the ${pr.title.en} project end to end, on schedule.`,
    zh: `Realtek 全程负责${pr.title.zh}项目的勘察、设计与实施，并按期交付运行。`,
  },
  content: projectBody,
}))

/* ---------- Posts ---------- */

const postBody = doc(
  p('Đây là nội dung mẫu. Trình soạn thảo hỗ trợ tiêu đề, danh sách, bảng, hình ảnh, liên kết và video YouTube.'),
  h('Điểm chính'),
  ul([
    'Nội dung ngắn gọn, dễ đọc trên điện thoại',
    'Ảnh minh hoạ được tối ưu tự động',
    'Tiêu đề và mô tả SEO riêng cho từng bài',
  ]),
  p('Bên A có thể nhập bản dịch tiếng Anh và tiếng Trung cho từng bài viết.'),
)

export const posts = [
  {
    slug: 'realtek-launches-new-website',
    featuredImage: photo('teamTable'),
    category: 'company-news',
    title: { vi: 'Realtek ra mắt website mới', en: 'Realtek launches its new website', zh: 'Realtek 新网站上线' },
  },
  {
    slug: 'wifi-7-for-business',
    featuredImage: photo('womanPortrait'),
    category: 'technology',
    title: {
      vi: 'Wi-Fi 7 và lợi ích cho doanh nghiệp',
      en: 'Wi-Fi 7 and what it means for business',
      zh: 'Wi-Fi 7 对企业的意义',
    },
  },
  {
    slug: 'data-center-cooling-tips',
    featuredImage: photo('whiteboard'),
    category: 'technology',
    title: {
      vi: 'Giải pháp làm mát phòng máy chủ tiết kiệm điện',
      en: 'Energy-efficient server room cooling',
      zh: '节能机房冷却方案',
    },
  },
  {
    slug: 'network-security-checklist',
    featuredImage: photo('analyst'),
    category: 'technology',
    title: {
      vi: 'Danh sách kiểm tra bảo mật mạng cho văn phòng',
      en: 'A network security checklist for offices',
      zh: '办公室网络安全检查清单',
    },
  },
  {
    slug: 'technology-conference-2026',
    featuredImage: photo('teamGroup'),
    category: 'events',
    title: {
      vi: 'Realtek tham dự hội thảo công nghệ 2026',
      en: 'Realtek at the 2026 technology conference',
      zh: 'Realtek 参加 2026 技术大会',
    },
  },
  {
    slug: 'year-end-customer-meeting',
    featuredImage: photo('womenTeam'),
    category: 'company-news',
    title: { vi: 'Gặp gỡ khách hàng cuối năm', en: 'Year-end customer meeting', zh: '年终客户交流会' },
  },
].map((post, i) => ({
  ...post,
  daysAgo: i * 9,
  excerpt: {
    vi: 'Bài viết mẫu để xem trước giao diện. Nội dung chính thức sẽ do Realtek cập nhật trong trang quản trị.',
    en: 'Sample article for previewing the layout. Realtek will publish the actual content from the admin.',
    zh: '用于预览版面的示例文章，正式内容将由 Realtek 在后台更新。',
  },
  content: postBody,
}))

/* ---------- Documents ---------- */

const documentBody = doc(
  h('Nội dung chính', 'h3'),
  ul(['Phạm vi áp dụng và đối tượng sử dụng', 'Các bước thực hiện chi tiết', 'Lưu ý an toàn và kiểm tra chất lượng']),
  p('Tài liệu được lưu trên kho lưu trữ đám mây. Bấm "Tải tài liệu" để mở trang tải về.'),
)

export const documents = [
  {
    slug: 'realtek-company-profile',
    category: 'company-profile',
    coverImage: photo('skylineHcmc'),
    fileFormat: 'pdf',
    fileSize: '8.4 MB',
    pageCount: 32,
    provider: 'gdrive',
    downloadCount: 276,
    title: {
      vi: 'Hồ sơ năng lực Realtek Telecom',
      en: 'Realtek Telecom company profile',
      zh: 'Realtek Telecom 公司简介',
    },
    keywords: { vi: 'ho so nang luc, gioi thieu cong ty', en: 'company profile, capability', zh: '公司简介, 能力' },
  },
  {
    slug: 'structured-cabling-guide',
    category: 'technical-documents',
    coverImage: photo('techPanel'),
    fileFormat: 'pdf',
    fileSize: '3.1 MB',
    pageCount: 48,
    provider: 'onedrive',
    downloadCount: 203,
    title: {
      vi: 'Hướng dẫn thi công cáp mạng có cấu trúc',
      en: 'Structured cabling installation guide',
      zh: '综合布线施工指南',
    },
    keywords: {
      vi: 'cap mang, cat6, patch panel, thi cong',
      en: 'cabling, cat6, patch panel',
      zh: '布线, 六类线, 配线架',
    },
  },
  {
    slug: 'fiber-splicing-procedure',
    category: 'technical-documents',
    coverImage: photo('techHelmet'),
    fileFormat: 'pdf',
    fileSize: '2.2 MB',
    pageCount: 20,
    provider: 'gdrive',
    downloadCount: 312,
    title: { vi: 'Quy trình hàn nối cáp quang', en: 'Fiber optic splicing procedure', zh: '光纤熔接流程' },
    keywords: { vi: 'cap quang, han noi, otdr', en: 'fiber, splicing, otdr', zh: '光纤, 熔接' },
  },
  {
    slug: 'server-room-standards',
    category: 'technical-documents',
    coverImage: photo('facilityEngineer'),
    fileFormat: 'docx',
    fileSize: '1.6 MB',
    pageCount: 26,
    provider: 'onedrive',
    downloadCount: 404,
    title: { vi: 'Tiêu chuẩn thiết kế phòng máy chủ', en: 'Server room design standards', zh: '机房设计标准' },
    keywords: {
      vi: 'phong may chu, data center, lam mat, ups',
      en: 'server room, data center, cooling, ups',
      zh: '机房, 数据中心, 制冷',
    },
  },
  {
    slug: 'network-equipment-catalogue-2026',
    category: 'catalogues',
    coverImage: photo('whiteboard'),
    fileFormat: 'pdf',
    fileSize: '12.8 MB',
    pageCount: 64,
    provider: 'gdrive',
    downloadCount: 309,
    title: { vi: 'Catalogue thiết bị mạng 2026', en: 'Network equipment catalogue 2026', zh: '2026 网络设备目录' },
    keywords: {
      vi: 'switch, router, wifi, thiet bi',
      en: 'switch, router, wifi, equipment',
      zh: '交换机, 路由器, 设备',
    },
  },
  {
    slug: 'wifi-survey-checklist',
    category: 'technical-documents',
    coverImage: photo('officeTeam'),
    fileFormat: 'xlsx',
    fileSize: '420 KB',
    pageCount: 4,
    provider: 'gdrive',
    downloadCount: 158,
    title: { vi: 'Bảng kiểm khảo sát Wi-Fi', en: 'Wi-Fi site survey checklist', zh: 'Wi-Fi 勘测检查表' },
    keywords: { vi: 'wifi, khao sat, song, access point', en: 'wifi, survey, access point', zh: '无线, 勘测' },
  },
  {
    slug: 'service-request-form',
    category: 'forms',
    coverImage: photo('officeDesk'),
    fileFormat: 'docx',
    fileSize: '85 KB',
    pageCount: 2,
    provider: 'onedrive',
    downloadCount: 97,
    title: { vi: 'Mẫu phiếu yêu cầu dịch vụ', en: 'Service request form', zh: '服务申请表' },
    keywords: { vi: 'bieu mau, yeu cau, bao tri', en: 'form, request, maintenance', zh: '表格, 申请' },
  },
  {
    slug: 'maintenance-handover-template',
    category: 'forms',
    coverImage: photo('electronicsBench'),
    fileFormat: 'docx',
    fileSize: '120 KB',
    pageCount: 3,
    provider: 'gdrive',
    downloadCount: 64,
    title: { vi: 'Mẫu biên bản bàn giao bảo trì', en: 'Maintenance handover template', zh: '维护交接单模板' },
    keywords: { vi: 'bien ban, ban giao, bao tri', en: 'handover, maintenance', zh: '交接, 维护' },
  },
].map((d, i) => ({
  ...d,
  provider: d.provider as 'gdrive' | 'onedrive',
  fileFormat: d.fileFormat as 'pdf' | 'docx' | 'xlsx',
  daysAgo: i * 5,
  // Placeholder links: replace with the real shared files.
  externalUrl: d.provider === 'gdrive' ? 'https://drive.google.com/drive/my-drive' : 'https://onedrive.live.com/',
  summary: {
    vi: `${d.title.vi} — tài liệu mẫu minh hoạ trang trung gian. Nội dung giới thiệu giúp khách hiểu tài liệu trước khi tải về.`,
    en: `${d.title.en} — a sample document showing the intermediate page. The overview helps visitors understand the file before downloading.`,
    zh: `${d.title.zh}——示例资料，用于展示中间页。下载前的简介帮助访客了解资料内容。`,
  },
  content: documentBody,
}))

/* ---------- Sliders ---------- */

type Slide = { image: PhotoRef; eyebrow?: L; heading?: L; text?: L; button?: { label: L; url: string } }

export const sliders: { placement: 'home' | 'about' | 'documents'; name: string; slides: Slide[] }[] = [
  {
    placement: 'home',
    name: 'Trang chủ',
    slides: [
      {
        image: photo('earth'),
        eyebrow: { vi: 'Realtek Telecom', en: 'Realtek Telecom', zh: 'Realtek Telecom' },
        heading: {
          vi: 'Kết nối hạ tầng số cho doanh nghiệp',
          en: 'Connecting digital infrastructure for business',
          zh: '为企业连接数字基础设施',
        },
        text: {
          vi: 'Giải pháp mạng, viễn thông và công nghệ thông tin được thiết kế cho vận hành ổn định và mở rộng lâu dài.',
          en: 'Network, telecom and IT solutions designed for stable operation and long-term growth.',
          zh: '为稳定运行和长期发展而设计的网络、电信及 IT 解决方案。',
        },
        button: { label: { vi: 'Khám phá dịch vụ', en: 'Explore services', zh: '了解服务' }, url: '/services' },
      },
      {
        image: photo('facilityEngineer'),
        eyebrow: { vi: 'Trung tâm dữ liệu', en: 'Data center', zh: '数据中心' },
        heading: { vi: 'Vận hành liên tục, an toàn dữ liệu', en: 'Always on, always secure', zh: '持续运行，数据安全' },
        text: {
          vi: 'Từ phòng máy chủ đến trung tâm dữ liệu, Realtek đồng hành từ khảo sát đến bảo trì.',
          en: 'From server rooms to data centers, Realtek supports you from survey to maintenance.',
          zh: '从机房到数据中心，Realtek 全程提供从勘察到运维的服务。',
        },
        button: { label: { vi: 'Xem dự án', en: 'View projects', zh: '查看项目' }, url: '/projects' },
      },
      {
        image: photo('skylineHcmc'),
        eyebrow: { vi: 'Thư viện tài liệu', en: 'Document library', zh: '资料库' },
        heading: {
          vi: 'Tài liệu kỹ thuật luôn sẵn sàng',
          en: 'Technical documents, ready when you are',
          zh: '技术资料，随时可查',
        },
        text: {
          vi: 'Tra cứu hồ sơ năng lực, hướng dẫn thi công và catalogue thiết bị.',
          en: 'Browse company profiles, installation guides and equipment catalogues.',
          zh: '查阅公司简介、施工指南及设备目录。',
        },
        button: { label: { vi: 'Tìm tài liệu', en: 'Find documents', zh: '查找资料' }, url: '/documents' },
      },
    ],
  },
  { placement: 'about', name: 'Giới thiệu', slides: [{ image: photo('meeting') }, { image: photo('teamTable') }] },
  {
    placement: 'documents',
    name: 'Tài liệu',
    slides: [{ image: photo('womanMonitors') }, { image: photo('analyst') }],
  },
]

/* ---------- Partners (fictional placeholder names; logos in public/demo/partners) ---------- */

export const partners = ['NORTHWIND', 'CONTOSO', 'FABRIKAM', 'LITWARE', 'TAILSPIN', 'ADATUM']
export const partnerLogoPath = (name: string) => `/demo/partners/${name.toLowerCase()}.svg`

/* ---------- Globals ---------- */

const address: L = {
  vi: 'Phòng 1505, Tầng 15, Tòa nhà Vincom Center, 72 Lê Thánh Tôn, Phường Sài Gòn, TP. Hồ Chí Minh',
  en: 'Room 1505, 15th Floor, Vincom Center, 72 Le Thanh Ton, Sai Gon Ward, Ho Chi Minh City',
  zh: '胡志明市西贡坊黎圣宗街 72 号 Vincom Center 15 楼 1505 室',
}

export const siteSettings = {
  companyName: {
    vi: 'Công ty Cổ phần Tin học Viễn thông Realtek',
    en: 'Realtek Informatics & Telecommunication JSC',
    zh: 'Realtek 信息电信股份公司',
  },
  shortName: 'Realtek Telecom',
  tagline: { vi: 'Kết nối hạ tầng số', en: 'Connecting digital infrastructure', zh: '连接数字基础设施' },
  description: {
    vi: 'Realtek cung cấp giải pháp hạ tầng mạng, viễn thông và công nghệ thông tin cho doanh nghiệp.',
    en: 'Realtek provides network infrastructure, telecom and IT solutions for businesses.',
    zh: 'Realtek 为企业提供网络基础设施、电信及信息技术解决方案。',
  },
  taxCode: '0314140632',
  address,
  hotline: '028 3830 2678',
  workingHours: {
    vi: 'Thứ Hai – Thứ Sáu, 8:00 – 17:30',
    en: 'Monday – Friday, 8:00 – 17:30',
    zh: '周一至周五 8:00 – 17:30',
  },
  mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.vi)}`,
  mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent('Vincom Center, 72 Lê Thánh Tôn, TP. Hồ Chí Minh')}&output=embed`,
  defaultMetaTitle: {
    vi: 'Realtek Telecom — Giải pháp hạ tầng mạng & viễn thông',
    en: 'Realtek Telecom — Network & telecom infrastructure',
    zh: 'Realtek Telecom — 网络与电信基础设施',
  },
  defaultMetaDescription: {
    vi: 'Công ty Cổ phần Tin học Viễn thông Realtek — giải pháp hạ tầng mạng, viễn thông và công nghệ thông tin cho doanh nghiệp.',
    en: 'Realtek Informatics & Telecommunication JSC — network infrastructure, telecom and IT solutions for businesses.',
    zh: 'Realtek 信息电信股份公司——为企业提供网络基础设施、电信及信息技术解决方案。',
  },
  defaultOgImage: photo('earth'),
}

export const homePage = {
  intro: {
    eyebrow: { vi: 'Về Realtek', en: 'About Realtek', zh: '关于 Realtek' },
    heading: {
      vi: 'Giải pháp công nghệ thông tin & viễn thông toàn diện',
      en: 'Complete IT & telecom solutions',
      zh: '全方位信息技术与电信解决方案',
    },
    text: {
      vi: 'Realtek đồng hành cùng doanh nghiệp từ khâu khảo sát, thiết kế đến thi công và vận hành hệ thống mạng, viễn thông, trung tâm dữ liệu. Mỗi giải pháp được xây dựng theo nhu cầu thực tế và sẵn sàng mở rộng.',
      en: 'Realtek works with businesses from survey and design through installation and operation of networks, telecom systems and data centers. Every solution is built around real needs and ready to grow.',
      zh: 'Realtek 从勘察、设计到施工与运维，全程陪伴企业建设网络、电信系统及数据中心。每一套方案都依据实际需求打造，并可随时扩展。',
    },
    image: photo('meeting'),
    link: { label: { vi: 'Tìm hiểu thêm', en: 'Learn more', zh: '了解更多' }, url: '/about' },
    stats: [
      { value: 15, suffix: '+', label: { vi: 'Năm kinh nghiệm', en: 'Years of experience', zh: '年行业经验' } },
      { value: 500, suffix: '+', label: { vi: 'Dự án triển khai', en: 'Projects delivered', zh: '已实施项目' } },
      { value: 120, suffix: '+', label: { vi: 'Khách hàng doanh nghiệp', en: 'Business clients', zh: '企业客户' } },
      {
        value: 40,
        suffix: '+',
        label: { vi: 'Kỹ sư & kỹ thuật viên', en: 'Engineers & technicians', zh: '工程师与技术人员' },
      },
    ],
  },
  highlight: {
    image: photo('skylineFlowers'),
    eyebrow: { vi: 'Realtek Telecom', en: 'Realtek Telecom', zh: 'Realtek Telecom' },
    heading: {
      vi: 'Đồng hành cùng doanh nghiệp\ntrên hành trình chuyển đổi số',
      en: 'Alongside businesses\non their digital journey',
      zh: '与企业同行\n共赴数字化转型之路',
    },
    text: {
      vi: 'Hạ tầng vững chắc là nền tảng cho mọi ứng dụng số. Realtek giúp hệ thống của bạn vận hành ổn định hôm nay và sẵn sàng cho ngày mai.',
      en: 'Solid infrastructure underpins every digital service. Realtek keeps your systems stable today and ready for tomorrow.',
      zh: '稳固的基础设施是一切数字应用的基石。Realtek 让您的系统今天稳定运行，明天从容扩展。',
    },
    link: { label: { vi: 'Liên hệ tư vấn', en: 'Talk to us', zh: '咨询我们' }, url: '/contact' },
  },
}

export const aboutPage = {
  heading: { vi: 'Về Realtek Telecom', en: 'About Realtek Telecom', zh: '关于 Realtek Telecom' },
  lead: {
    vi: 'Realtek xây dựng hạ tầng công nghệ vững chắc để doanh nghiệp tập trung vào công việc kinh doanh của mình.',
    en: 'Realtek builds solid technology infrastructure so businesses can focus on what they do best.',
    zh: 'Realtek 构建稳固的技术基础设施，让企业专注于自身业务。',
  },
  image: photo('teamGroup'),
  content: doc(
    p(
      'Công ty Cổ phần Tin học Viễn thông Realtek hoạt động trong lĩnh vực hạ tầng mạng, viễn thông và công nghệ thông tin. Đội ngũ kỹ sư của Realtek tư vấn, thiết kế, thi công và vận hành hệ thống cho khách hàng doanh nghiệp.',
    ),
    p('Nội dung trang này là nội dung mẫu. Bên A cập nhật lịch sử, tầm nhìn và năng lực thực tế trong trang quản trị.'),
  ),
  values: [
    {
      title: { vi: 'Tận tâm', en: 'Dedicated', zh: '用心' },
      text: {
        vi: 'Lắng nghe và giải quyết đúng nhu cầu của khách hàng.',
        en: 'We listen and solve the problems our clients actually have.',
        zh: '倾听并切实解决客户需求。',
      },
    },
    {
      title: { vi: 'Chuẩn mực', en: 'Rigorous', zh: '规范' },
      text: {
        vi: 'Thi công theo tiêu chuẩn kỹ thuật, minh bạch trong từng hạng mục.',
        en: 'Built to technical standards, transparent at every step.',
        zh: '按技术标准施工，每个环节透明。',
      },
    },
    {
      title: { vi: 'Bền vững', en: 'Lasting', zh: '持久' },
      text: {
        vi: 'Giải pháp vận hành ổn định và sẵn sàng mở rộng lâu dài.',
        en: 'Solutions that run reliably and scale over time.',
        zh: '方案稳定运行，并可长期扩展。',
      },
    },
  ],
  milestones: [
    {
      year: '2016',
      title: { vi: 'Thành lập công ty', en: 'Company founded', zh: '公司成立' },
      text: {
        vi: 'Bắt đầu với dịch vụ hạ tầng mạng cho văn phòng.',
        en: 'Started with network infrastructure for offices.',
        zh: '从办公室网络基础设施起步。',
      },
    },
    {
      year: '2019',
      title: { vi: 'Mở rộng viễn thông', en: 'Into telecom', zh: '拓展电信' },
      text: {
        vi: 'Triển khai các dự án cáp quang và tổng đài.',
        en: 'Delivered fiber and PBX projects.',
        zh: '实施光纤与交换机项目。',
      },
    },
    {
      year: '2022',
      title: { vi: 'Trung tâm dữ liệu', en: 'Data centers', zh: '数据中心' },
      text: {
        vi: 'Thực hiện các dự án phòng máy chủ quy mô lớn.',
        en: 'Took on large server room projects.',
        zh: '承接大型机房项目。',
      },
    },
    {
      year: '2026',
      title: { vi: 'Chặng đường mới', en: 'A new chapter', zh: '新征程' },
      text: {
        vi: 'Tiếp tục đồng hành cùng doanh nghiệp chuyển đổi số.',
        en: 'Supporting businesses through digital transformation.',
        zh: '持续陪伴企业数字化转型。',
      },
    },
  ],
}

/* ---------- Localization helper ---------- */

export type Loc = keyof L

function isLocalized(value: unknown): value is L {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 3 &&
    'vi' in value &&
    'en' in value &&
    'zh' in value
  )
}

/**
 * Deep-copies content for one locale: `{ vi, en, zh }` becomes the string for `locale`,
 * `photo()` references go through `resolvePhoto` (a Payload media id when seeding, a media object in demo mode).
 */
export function localize<T>(value: T, locale: Loc, resolvePhoto: (key: PhotoKey) => unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => localize(v, locale, resolvePhoto))
  if (isLocalized(value)) return value[locale]
  if (value && typeof value === 'object') {
    if ('$photo' in value) return resolvePhoto((value as PhotoRef).$photo)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, locale, resolvePhoto)]))
  }
  return value
}
