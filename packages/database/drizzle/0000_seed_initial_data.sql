-- ==============================================================================
-- 🚗 CARDEALER MONOREPO - UNIFIED SQL SEED SCRIPT 🚗
-- Tham chiếu đầy đủ 11 Dòng xe & Phiên bản từ be-cardealer/src/scripts/seed-data.ts
-- Toàn bộ ID được PostgreSQL tự động sinh (DEFAULT gen_random_uuid()).
-- Các bảng con tự động liên kết với bảng cha thông qua subquery theo slug / ten_mau.
-- Mật khẩu Admin đã băm chuẩn Bcrypt (Mật khẩu: AdminPassword123!).
-- ==============================================================================

-- 1. Seed Quản trị viên Showroom mặc định
INSERT INTO users (email, password_hash, full_name, phone, avatar_url, role, token_version)
VALUES (
  'admin@xehyundaivinh.com',
  '$2b$10$YKF333NEySFgx.ieGSZLKOSZSAAqvYvK5mNJv601mEMxRGTQ4Do5a',
  'Tuấn Hyundai - Quản Trị Showroom',
  '0981.234.567',
  '/images/avatars/sale-tuan.webp',
  'admin',
  1
) ON CONFLICT (email) DO NOTHING;
--> statement-breakpoint
-- 2. Seed Bảng màu ngoại thất Master
INSERT INTO colors (ten_mau, hex_code, is_two_tone, secondary_hex_code, swatch_url)
VALUES 
  ('Trắng Ngọc Trai', '#F8F9FA', false, null, '/images/colors/swatch-white.png'),
  ('Đen Huyền Bí', '#111111', false, null, '/images/colors/swatch-black.png'),
  ('Đỏ Đô Quyến Rũ', '#990000', false, null, '/images/colors/swatch-red.png'),
  ('Xanh Rêu Emerald Độc Quyền', '#1A4D2E', false, null, '/images/colors/swatch-green.png'),
  ('Đỏ Nóc Đen Thể Thao', '#B22222', true, '#0B0B0B', '/images/colors/swatch-twotone.png')
ON CONFLICT (ten_mau) DO NOTHING;
--> statement-breakpoint
-- 3. Seed 11 Dòng xe Hyundai chính hãng
INSERT INTO cars (ten_xe, slug, anh_dai_dien_url, catalog_file_url, segment, tax_rate, tra_truoc_tu, promotion_summary, fuel_type, highlight_features, mo_ta_chung, is_featured, status, sort_order)
VALUES 
  (
    'Hyundai Grand i10',
    'grand-i10',
    '/images/cars/grand-i10.webp',
    '/docs/catalogs/grand-i10.pdf',
    'hatchback',
    0.10,
    75000000,
    'Chỉ từ 75 triệu nhận xe, hỗ trợ đăng ký biển số TP. Vinh',
    'Xăng',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Kappa 1.2L Bền Bỉ"},{"icon":"transmission","title":"HỘP SỐ","value":"Tự Động 4 Cấp / 5 Cấp Sàn"},{"icon":"power","title":"CÔNG SUẤT","value":"83 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Linh Hoạt"},{"icon":"fuel","title":"SIÊU TIẾT KIỆM","value":"Chỉ 5.4L/100km"},{"icon":"safety","title":"CẢM BIẾN","value":"Cảm Biến Áp Suất Lốp TPMS"}]'::jsonb,
    'Mẫu xe đô thị cỡ A nhỏ gọn, chi phí sử dụng siêu rẻ, phù hợp gia đình trẻ và kinh doanh dịch vụ.',
    false,
    'published',
    1
  ),
  (
    'Hyundai Accent All-New',
    'accent',
    '/images/cars/accent.webp',
    '/docs/catalogs/accent.pdf',
    'sedan',
    0.10,
    90000000,
    'Ưu đãi tiền mặt + Gói phụ kiện chính hãng, trả góp chỉ từ 90 triệu',
    'Xăng',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream G1.5 Mới"},{"icon":"transmission","title":"HỘP SỐ","value":"6 MT / Vô Cấp iVT"},{"icon":"power","title":"CÔNG SUẤT","value":"115 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Rộng Rãi Bậc Nhất"},{"icon":"fuel","title":"TIẾT KIỆM","value":"5.6L/100km Hỗn Hợp"},{"icon":"safety","title":"AN TOÀN","value":"Hyundai SmartSense Cao Cấp"}]'::jsonb,
    'Hyundai Accent All-New thiết kế Fastback thể thao lột xác, kích thước vượt trội cùng gói công nghệ an toàn SmartSense tiên tiến.',
    true,
    'published',
    2
  ),
  (
    'Hyundai Elantra',
    'elantra',
    '/images/cars/elantra.webp',
    '/docs/catalogs/elantra.pdf',
    'sedan',
    0.10,
    120000000,
    'Hỗ trợ 50% trước bạ + Tặng bảo hiểm thân vỏ 1 năm',
    'Xăng, Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Gamma 1.6 / Smartstream 2.0 / 1.6 Turbo"},{"icon":"transmission","title":"HỘP SỐ","value":"6 AT / 7 DCT Thể Thao"},{"icon":"power","title":"CÔNG SUẤT","value":"128 - 204 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Phong Cách Coupe"},{"icon":"fuel","title":"TIÊU THỤ","value":"6.8L/100km Đường Trường"},{"icon":"safety","title":"CẢNH BÁO","value":"Cảnh Báo Điểm Mù BCA"}]'::jsonb,
    'Hyundai Elantra mang phong cách thiết kế Sensuous Sportiness cuốn hút, cảm giác lái thể thao đầy phấn khích.',
    false,
    'published',
    3
  ),
  (
    'Hyundai Venue',
    'venue',
    '/images/cars/venue.webp',
    '/docs/catalogs/venue.pdf',
    'suv',
    0.10,
    100000000,
    'Tặng gói phụ kiện thể thao + Trả góp 85% giá trị xe',
    'Xăng Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Kappa 1.0 Turbo GDi"},{"icon":"transmission","title":"HỘP SỐ","value":"7 DCT Ly Hợp Kép"},{"icon":"power","title":"CÔNG SUẤT","value":"120 Mã Lực Tăng Tốc Nhanh"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Gầm Cao Năng Động"},{"icon":"fuel","title":"TIÊU THỤ","value":"5.7L/100km Tiết Kiệm"},{"icon":"safety","title":"TIỆN NGHI","value":"Cửa Sổ Trời & Đèn LED"}]'::jsonb,
    'Hyundai Venue mẫu A-SUV gầm cao cá tính, động cơ Turbo bốc và thiết kế hiện đại năng động cho giới trẻ đô thị.',
    false,
    'draft',
    4
  ),
  (
    'Hyundai Creta',
    'creta',
    '/images/cars/creta.webp',
    '/docs/catalogs/creta.pdf',
    'suv',
    0.10,
    115000000,
    'Trả trước chỉ 115 triệu nhận xe ngay, lãi suất ưu đãi cố định',
    'Xăng',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream G1.5"},{"icon":"transmission","title":"HỘP SỐ","value":"Vô Cấp Thông Minh iVT"},{"icon":"power","title":"CÔNG SUẤT","value":"115 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Tiện Nghi"},{"icon":"fuel","title":"TIẾT KIỆM","value":"Chỉ 6.1L/100km"},{"icon":"safety","title":"AN TOÀN","value":"Hệ Thống Phanh Tay Điện Tử & SmartSense"}]'::jsonb,
    'Mẫu B-SUV bán chạy hàng đầu phân khúc với phanh tay điện tử, làm mát ghế và gói an toàn SmartSense chủ động.',
    true,
    'published',
    5
  ),
  (
    'Hyundai Tucson',
    'tucson',
    '/images/cars/tucson.webp',
    '/docs/catalogs/tucson.pdf',
    'suv',
    0.10,
    150000000,
    'Hỗ trợ 50% trước bạ + Tặng gói phụ kiện cao cấp chính hãng',
    'Xăng, Dầu, Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream G2.0 / 1.6 Turbo / D2.0"},{"icon":"transmission","title":"HỘP SỐ","value":"6 AT / 7 DCT / 8 AT Tự Động"},{"icon":"power","title":"CÔNG SUẤT","value":"180 - 186 Mã Lực Cực Đại"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Rộng Nhất Phân Khúc"},{"icon":"fuel","title":"NHIÊN LIỆU","value":"Tiết Kiệm 6.3L/100km"},{"icon":"safety","title":"AN TOÀN","value":"Hyundai SmartSense Thế Hệ Mới"}]'::jsonb,
    'Hyundai Tucson thiết kế Parametric Dynamic táo bạo, nội thất sang trọng chuẩn châu Âu cùng dẫn động HTRAC linh hoạt.',
    true,
    'published',
    6
  ),
  (
    'Hyundai Santa Fe All-New',
    'santa-fe',
    '/images/cars/santa-fe.webp',
    '/docs/catalogs/santa-fe.pdf',
    'suv',
    0.10,
    210000000,
    'Ưu đãi tháng: Tặng bảo hiểm thân vỏ + Gói bảo dưỡng miễn phí',
    'Xăng, Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream G2.5 / Turbo GDi"},{"icon":"transmission","title":"HỘP SỐ","value":"Tự Động 8 Cấp / 8 DCT Mượt Mà"},{"icon":"power","title":"CÔNG SUẤT","value":"194 - 281 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"7 Chỗ / 6 Chỗ Ghế Thương Gia"},{"icon":"fuel","title":"TIÊU THỤ","value":"8.2L/100km Đường Hỗn Hợp"},{"icon":"safety","title":"AN TOÀN","value":"Gói SmartSense Full Tính Năng"}]'::jsonb,
    'Thế hệ Santa Fe hoàn toàn mới với dáng vẻ Boxy vuông vức bề thế, không gian cốp xe rộng rãi bậc nhất và ghế thương gia đẳng cấp.',
    true,
    'published',
    7
  ),
  (
    'Hyundai Custin',
    'custin',
    '/images/cars/custin.webp',
    '/docs/catalogs/custin.pdf',
    'mpv',
    0.10,
    160000000,
    'Tặng bảo hiểm vật chất + Hỗ trợ vay trả góp 85%',
    'Xăng Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream 1.5T / 2.0T Turbo"},{"icon":"transmission","title":"HỘP SỐ","value":"Tự Động 8 Cấp Mượt Mà"},{"icon":"power","title":"CÔNG SUẤT","value":"170 - 236 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"7 Chỗ / Hàng Ghế 2 Thương Gia"},{"icon":"door","title":"CỬA LÙA","value":"Cửa Trượt Điện Tự Động 2 Bên"},{"icon":"safety","title":"AN TOÀN","value":"Hyundai SmartSense Thông Minh"}]'::jsonb,
    'Hyundai Custin mẫu MPV cỡ trung cao cấp hàng đầu với cửa trượt điện thông minh, hàng ghế thứ 2 thương gia không trọng lực.',
    false,
    'published',
    8
  ),
  (
    'Hyundai Stargazer X',
    'stargazer-x',
    '/images/cars/stargazer-x.webp',
    '/docs/catalogs/stargazer-x.pdf',
    'mpv',
    0.10,
    95000000,
    'Trả trước từ 95 triệu, tặng phụ kiện chính hãng',
    'Xăng',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Smartstream G1.5 Bền Bỉ"},{"icon":"transmission","title":"HỘP SỐ","value":"Vô Cấp Thông Minh iVT"},{"icon":"power","title":"CÔNG SUẤT","value":"115 Mã Lực"},{"icon":"seat","title":"CHỖ NGỒI","value":"7 Chỗ Rộng Thoải Mái"},{"icon":"brake","title":"PHANH","value":"Phanh Đĩa 4 Bánh + Phanh Tay Điện Tử"},{"icon":"sound","title":"ÂM THANH","value":"Loa Bose Cao Cấp"}]'::jsonb,
    'Hyundai Stargazer X phong cách SUV gầm cao đa dụng, 7 chỗ ngồi rộng rãi, ngập tràn tiện nghi và loa Bose giải trí đỉnh cao.',
    false,
    'published',
    9
  ),
  (
    'Hyundai Palisade',
    'palisade',
    '/images/cars/palisade.webp',
    '/docs/catalogs/palisade.pdf',
    'suv',
    0.10,
    290000000,
    'Đặc quyền bảo dưỡng VIP + Tặng gói bảo hiểm thân vỏ',
    'Dầu Turbo',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"R2.2 CRDi Dầu Mạnh Mẽ"},{"icon":"transmission","title":"HỘP SỐ","value":"8 AT Tự Động Điện Tử"},{"icon":"power","title":"CÔNG SUẤT","value":"200 Mã Lực / 440 Nm"},{"icon":"seat","title":"CHỖ NGỒI","value":"6 Chỗ / 7 Chỗ Đẳng Cấp Chủ Tịch"},{"icon":"drive","title":"DẪN ĐỘNG","value":"HTRAC 4 Bánh Thông Minh"},{"icon":"safety","title":"AN TOÀN","value":"Hyundai SmartSense Tối Tân"}]'::jsonb,
    'Hyundai Palisade mẫu SUV đầu bảng (Flagship) bề thế, uy nghi, trang bị ghế bọc da Nappa cao cấp và hệ thống âm thanh Infinity.',
    true,
    'published',
    10
  ),
  (
    'Hyundai Ioniq 5',
    'ioniq-5',
    '/images/cars/ioniq-5.webp',
    '/docs/catalogs/ioniq-5.pdf',
    'ev',
    0.00,
    260000000,
    'Miễn 100% lệ phí trước bạ + Tặng bộ sạc tại nhà chính hãng',
    'Điện EV',
    '[{"icon":"engine","title":"ĐỘNG CƠ","value":"Mô-tơ Điện Công Suất Cao"},{"icon":"battery","title":"PIN & SẠC","value":"Sạc Siêu Nhanh 10% - 80% trong 18 Phút"},{"icon":"power","title":"CÔNG SUẤT","value":"217 Mã Lực Tức Thì"},{"icon":"seat","title":"CHỖ NGỒI","value":"5 Chỗ Sàn Phẳng E-GMP"},{"icon":"distance","title":"QUÃNG ĐƯỜNG","value":"451km Mỗi Lần Sạc Đầy"},{"icon":"v2l","title":"TIỆN ÍCH","value":"Công Nghệ V2L Cấp Điện Thiết Bị Ngoài"}]'::jsonb,
    'Hyundai Ioniq 5 mẫu xe điện tương lai từng đạt giải Xe Thế Giới của Năm (World Car of the Year), thiết kế Parametric Pixel độc đáo.',
    true,
    'draft',
    11
  )
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
-- 4. Seed Phiên bản xe (car_versions) cho 11 dòng xe
-- 4.1 Phiên bản Hyundai Grand i10
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'grand-i10'), 'Hatchback 1.2 MT Tiêu chuẩn', 'hatchback-1-2-mt-tieu-chuan', 360000000, 345000000, 5, 'Kappa 1.2L', '5 MT', 'FWD', '/images/cars/grand-i10.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'grand-i10'), 'Hatchback 1.2 AT Tiêu chuẩn', 'hatchback-1-2-at-tieu-chuan', 405000000, 390000000, 5, 'Kappa 1.2L', '4 AT', 'FWD', '/images/cars/grand-i10.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'grand-i10'), 'Hatchback 1.2 AT Cao cấp', 'hatchback-1-2-at-cao-cap', 455000000, 435000000, 5, 'Kappa 1.2L', '4 AT', 'FWD', '/images/cars/grand-i10.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'grand-i10'), 'Sedan 1.2 MT Tiêu chuẩn', 'sedan-1-2-mt-tieu-chuan', 380000000, 365000000, 5, 'Kappa 1.2L', '5 MT', 'FWD', '/images/cars/grand-i10.webp', '[]'::jsonb, 4),
  ((SELECT id FROM cars WHERE slug = 'grand-i10'), 'Sedan 1.2 AT Cao cấp', 'sedan-1-2-at-cao-cap', 455000000, 435000000, 5, 'Kappa 1.2L', '4 AT', 'FWD', '/images/cars/grand-i10.webp', '[]'::jsonb, 5)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.2 Phiên bản Hyundai Accent All-New
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'accent'), '1.5 MT Tiêu chuẩn', '1-5-mt-tieu-chuan', 439000000, 425000000, 5, 'Smartstream G1.5', '6 MT', 'FWD', '/images/cars/accent.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'accent'), '1.5 AT Tiêu chuẩn', '1-5-at-tieu-chuan', 489000000, 470000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/accent.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'accent'), '1.5 AT Đặc biệt', '1-5-at-dac-biet', 529000000, 510000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/accent.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'accent'), '1.5 AT Cao cấp', '1-5-at-cao-cap', 569000000, 549000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/accent.webp', '[]'::jsonb, 4)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.3 Phiên bản Hyundai Elantra
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'elantra'), '1.6 AT Tiêu chuẩn', '1-6-at-tieu-chuan', 599000000, 579000000, 5, 'Gamma 1.6 MPI', '6 AT', 'FWD', '/images/cars/elantra.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'elantra'), '1.6 AT Đặc biệt', '1-6-at-dac-biet', 669000000, 649000000, 5, 'Gamma 1.6 MPI', '6 AT', 'FWD', '/images/cars/elantra.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'elantra'), '2.0 AT Cao cấp', '2-0-at-cao-cap', 729000000, 709000000, 5, 'Nu 2.0 MPI', '6 AT', 'FWD', '/images/cars/elantra.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'elantra'), 'N-Line 1.6 Turbo', 'n-line-1-6-turbo', 799000000, 769000000, 5, 'Smartstream 1.6 T-GDi', '7 DCT', 'FWD', '/images/cars/elantra.webp', '[]'::jsonb, 4)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.4 Phiên bản Hyundai Venue
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'venue'), '1.0 T-GDi Tiêu chuẩn', '1-0-t-gdi-tieu-chuan', 499000000, 479000000, 5, 'Kappa 1.0 Turbo', '7 DCT', 'FWD', '/images/cars/venue.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'venue'), '1.0 T-GDi Đặc biệt', '1-0-t-gdi-dac-biet', 539000000, 519000000, 5, 'Kappa 1.0 Turbo', '7 DCT', 'FWD', '/images/cars/venue.webp', '[]'::jsonb, 2)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.5 Phiên bản Hyundai Creta
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'creta'), '1.5 Tiêu chuẩn', '1-5-tieu-chuan', 599000000, 569000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/creta.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'creta'), '1.5 Đặc biệt', '1-5-dac-biet', 650000000, 625000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/creta.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'creta'), '1.5 Cao cấp', '1-5-cao-cap', 699000000, 669000000, 5, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/creta.webp', '[]'::jsonb, 3)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.6 Phiên bản Hyundai Tucson
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'tucson'), '2.0 Xăng Tiêu chuẩn', '2-0-xang-tieu-chuan', 769000000, 739000000, 5, 'Smartstream G2.0', '6 AT', 'FWD', '/images/cars/tucson.webp', '[{"groupName":"Kích Thước & Động Cơ","specs":[{"label":"Dài x Rộng x Cao","value":"4630 x 1865 x 1695 mm"},{"label":"Khoảng sáng gầm","value":"181 mm"}]}]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'tucson'), '2.0 Xăng Đặc biệt', '2-0-xang-dac-biet', 839000000, 809000000, 5, 'Smartstream G2.0', '6 AT', 'FWD', '/images/cars/tucson.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'tucson'), '2.0 Dầu Đặc biệt', '2-0-dau-dac-biet', 959000000, 929000000, 5, 'Smartstream D2.0', '8 AT', 'FWD', '/images/cars/tucson.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'tucson'), '1.6 Turbo HTRAC', '1-6-turbo-htrac', 989000000, 959000000, 5, 'Smartstream 1.6 T-GDi', '7 DCT', 'HTRAC AWD', '/images/cars/tucson.webp', '[{"groupName":"Kích Thước & Động Cơ","specs":[{"label":"Dài x Rộng x Cao","value":"4630 x 1865 x 1695 mm"},{"label":"Mâm đúc hợp kim","value":"19 inch thể thao"}]}]'::jsonb, 4)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.7 Phiên bản Hyundai Santa Fe All-New
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'santa-fe'), '2.5 Xăng Exclusive', '2-5-xang-exclusive', 1069000000, 1039000000, 7, 'Smartstream G2.5', '8 AT', 'FWD', '/images/cars/santa-fe.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'santa-fe'), '2.5 Xăng Prestige', '2-5-xang-prestige', 1265000000, 1235000000, 7, 'Smartstream G2.5', '8 AT', 'HTRAC AWD', '/images/cars/santa-fe.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'santa-fe'), '2.5 Xăng Calligraphy (7 chỗ)', '2-5-xang-calligraphy-7-cho', 1315000000, 1285000000, 7, 'Smartstream G2.5', '8 AT', 'HTRAC AWD', '/images/cars/santa-fe.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'santa-fe'), '2.5 Xăng Calligraphy (6 chỗ)', '2-5-xang-calligraphy-6-cho', 1315000000, 1285000000, 6, 'Smartstream G2.5', '8 AT', 'HTRAC AWD', '/images/cars/santa-fe.webp', '[]'::jsonb, 4),
  ((SELECT id FROM cars WHERE slug = 'santa-fe'), '2.5 Turbo Calligraphy', '2-5-turbo-calligraphy', 1365000000, 1330000000, 6, 'Smartstream 2.5 T-GDi', '8 DCT', 'HTRAC AWD', '/images/cars/santa-fe.webp', '[]'::jsonb, 5)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.8 Phiên bản Hyundai Custin
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'custin'), '1.5T Tiêu chuẩn', '1-5t-tieu-chuan', 820000000, 799000000, 7, 'Smartstream 1.5 T-GDi', '8 AT', 'FWD', '/images/cars/custin.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'custin'), '1.5T Đặc biệt', '1-5t-dac-biet', 915000000, 889000000, 7, 'Smartstream 1.5 T-GDi', '8 AT', 'FWD', '/images/cars/custin.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'custin'), '2.0T Cao cấp', '2-0t-cao-cap', 974000000, 949000000, 7, 'Smartstream 2.0 T-GDi', '8 AT', 'FWD', '/images/cars/custin.webp', '[]'::jsonb, 3)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.9 Phiên bản Hyundai Stargazer X
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'stargazer-x'), 'Tiêu chuẩn', 'tieu-chuan', 489000000, 469000000, 7, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/stargazer-x.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'stargazer-x'), 'X', 'x', 559000000, 539000000, 7, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/stargazer-x.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'stargazer-x'), 'X Cao cấp', 'x-cao-cap', 599000000, 579000000, 7, 'Smartstream G1.5', 'iVT', 'FWD', '/images/cars/stargazer-x.webp', '[]'::jsonb, 3)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.10 Phiên bản Hyundai Palisade
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'palisade'), 'Exclusive 7 chỗ', 'exclusive-7-cho', 1469000000, 1439000000, 7, 'R2.2 CRDi', '8 AT', 'FWD', '/images/cars/palisade.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'palisade'), 'Exclusive 6 chỗ', 'exclusive-6-cho', 1479000000, 1449000000, 6, 'R2.2 CRDi', '8 AT', 'FWD', '/images/cars/palisade.webp', '[]'::jsonb, 2),
  ((SELECT id FROM cars WHERE slug = 'palisade'), 'Prestige 7 chỗ', 'prestige-7-cho', 1559000000, 1519000000, 7, 'R2.2 CRDi', '8 AT', 'HTRAC AWD', '/images/cars/palisade.webp', '[]'::jsonb, 3),
  ((SELECT id FROM cars WHERE slug = 'palisade'), 'Prestige 6 chỗ', 'prestige-6-cho', 1589000000, 1549000000, 6, 'R2.2 CRDi', '8 AT', 'HTRAC AWD', '/images/cars/palisade.webp', '[]'::jsonb, 4)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5.11 Phiên bản Hyundai Ioniq 5
INSERT INTO car_versions (car_id, ten_phien_ban, slug, gia_niem_yet, gia_khuyen_mai, seat_count, dong_co, hop_so, dan_dong, anh_dai_dien_url, spec_groups, sort_order)
VALUES 
  ((SELECT id FROM cars WHERE slug = 'ioniq-5'), 'Exclusive', 'exclusive', 1300000000, 1269000000, 5, 'Mô-tơ điện 58 kWh', 'Đơn cấp', 'RWD', '/images/cars/ioniq-5.webp', '[]'::jsonb, 1),
  ((SELECT id FROM cars WHERE slug = 'ioniq-5'), 'Prestige', 'prestige', 1450000000, 1419000000, 5, 'Mô-tơ điện 72.6 kWh', 'Đơn cấp', 'RWD', '/images/cars/ioniq-5.webp', '[]'::jsonb, 2)
ON CONFLICT (car_id, slug) DO NOTHING;
--> statement-breakpoint
-- 5. Seed Liên kết màu theo từng phiên bản xe (version_colors)
-- Grand i10
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'grand-i10' AND cv.slug = 'hatchback-1-2-at-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/grand-i10-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'grand-i10' AND cv.slug = 'hatchback-1-2-at-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đỏ Đô Quyến Rũ'), '/images/cars/grand-i10-red.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Accent All-New
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'accent' AND cv.slug = '1-5-at-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/accent-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'accent' AND cv.slug = '1-5-at-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/accent-black.webp', false),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'accent' AND cv.slug = '1-5-at-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đỏ Đô Quyến Rũ'), '/images/cars/accent-red.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Elantra
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'elantra' AND cv.slug = 'n-line-1-6-turbo'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/elantra-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'elantra' AND cv.slug = 'n-line-1-6-turbo'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/elantra-black.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Venue
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'venue' AND cv.slug = '1-0-t-gdi-dac-biet'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/venue-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'venue' AND cv.slug = '1-0-t-gdi-dac-biet'), (SELECT id FROM colors WHERE ten_mau = 'Đỏ Nóc Đen Thể Thao'), '/images/cars/venue-twotone.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Creta
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'creta' AND cv.slug = '1-5-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/creta-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'creta' AND cv.slug = '1-5-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/creta-black.webp', false),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'creta' AND cv.slug = '1-5-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đỏ Nóc Đen Thể Thao'), '/images/cars/creta-twotone.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Tucson
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'tucson' AND cv.slug = '1-6-turbo-htrac'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/tucson-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'tucson' AND cv.slug = '1-6-turbo-htrac'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/tucson-black.webp', false),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'tucson' AND cv.slug = '1-6-turbo-htrac'), (SELECT id FROM colors WHERE ten_mau = 'Xanh Rêu Emerald Độc Quyền'), '/images/cars/tucson-green.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Santa Fe All-New
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'santa-fe' AND cv.slug = '2-5-turbo-calligraphy'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/santafe-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'santa-fe' AND cv.slug = '2-5-turbo-calligraphy'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/santafe-black.webp', false),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'santa-fe' AND cv.slug = '2-5-turbo-calligraphy'), (SELECT id FROM colors WHERE ten_mau = 'Xanh Rêu Emerald Độc Quyền'), '/images/cars/santafe-green.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Custin
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'custin' AND cv.slug = '2-0t-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/custin-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'custin' AND cv.slug = '2-0t-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/custin-black.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Stargazer X
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'stargazer-x' AND cv.slug = 'x-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/stargazer-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'stargazer-x' AND cv.slug = 'x-cao-cap'), (SELECT id FROM colors WHERE ten_mau = 'Đỏ Đô Quyến Rũ'), '/images/cars/stargazer-red.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Palisade
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'palisade' AND cv.slug = 'prestige-6-cho'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/palisade-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'palisade' AND cv.slug = 'prestige-6-cho'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/palisade-black.webp', false),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'palisade' AND cv.slug = 'prestige-6-cho'), (SELECT id FROM colors WHERE ten_mau = 'Xanh Rêu Emerald Độc Quyền'), '/images/cars/palisade-green.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- Ioniq 5
INSERT INTO version_colors (version_id, color_id, anh_xe_theo_mau_url, is_default)
VALUES 
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'ioniq-5' AND cv.slug = 'prestige'), (SELECT id FROM colors WHERE ten_mau = 'Trắng Ngọc Trai'), '/images/cars/ioniq5-white.webp', true),
  ((SELECT cv.id FROM car_versions cv JOIN cars c ON cv.car_id = c.id WHERE c.slug = 'ioniq-5' AND cv.slug = 'prestige'), (SELECT id FROM colors WHERE ten_mau = 'Đen Huyền Bí'), '/images/cars/ioniq5-black.webp', false)
ON CONFLICT (version_id, color_id) DO NOTHING;
--> statement-breakpoint
-- 6. Seed Cấu hình hệ thống toàn cục (system_settings)
INSERT INTO system_settings (key, data)
VALUES 
  (
    'site_settings',
    '{"siteTitle":"Hyundai Vinh - Đại Lý Ô Tô Ủy Quyền Chính Hãng","titleSuffix":"| Hotline: 0981.234.567","defaultDescription":"Đại lý phân phối xe Hyundai chính hãng tại Nghệ An, Hà Tĩnh. Giá tốt nhất, hỗ trợ trả góp 85%, giao xe tận nhà.","businessName":"Công ty Cổ phần Ô tô Hyundai Vinh","address":"Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An","phone":"0981.234.567"}'::jsonb
  ),
  (
    'contact_settings',
    '{"sellerName":"Tuấn Hyundai","sellerPhone":"0981.234.567","sellerZalo":"https://zalo.me/0981234567","sellerEmail":"admin@xehyundaivinh.com","sellerAddress":"Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An","sellerAvatar":"/images/avatars/sale-tuan.webp","workingHours":"08:00 - 18:00 (Thứ 2 - Chủ Nhật)"}'::jsonb
  ),
  (
    'event_banner',
    '{"enableBanner":true,"title":"ƯU ĐÃI ĐẶC QUYỀN THÁNG NÀY","subtitle":"Hỗ trợ 50% - 100% lệ phí trước bạ + Tặng gói phụ kiện chính hãng cao cấp","bannerImage":"/images/banners/hero-event.webp","showCountdown":true,"countdownEndTime":"2026-12-31T23:59:59Z","slotsLeft":5}'::jsonb
  ),
  (
    'showroom_settings',
    '{"showroomName":"Hyundai Vinh - Đại Lý Ô Tô Ủy Quyền Chính Hãng","hotlineKinhDoanh":"0981.234.567","hotlineDichVu":"0987.654.321","zaloNumber":"0981234567","email":"admin@xehyundaivinh.com","diaChi":"Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An","googleMapsUrl":"https://maps.google.com/?q=Hyundai+Vinh","facebookUrl":"https://facebook.com/hyundaivinh","youtubeUrl":"https://youtube.com/@hyundaivinh"}'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
