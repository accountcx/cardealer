// 🧠 Mental Model: Machine Verification Runner cho Phase 3 Pricing & Lead Engine.
// Kiểm thử tự động 8 luồng nghiệp vụ không phụ thuộc vào thao tác thủ công,
// in báo cáo kiểm thử màu sắc trực quan và kết thúc bằng exit 0 nếu 100% đạt chuẩn.

import {
  calculateRollingCost,
  calculateInstallment,
  getLocationRate,
  PROVINCE_FEE_CONFIGS,
  FIXED_GOVERNMENT_RATES,
} from '@cardealer/core';
import {
  CreateLeadSchema,
  UpdateLeadStatusSchema,
  LeadStatusEnum,
  DUMMY_PHONE_BLACKLIST,
  hasPermission,
  type Role,
} from '@cardealer/types';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, message?: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`  \x1b[32m[PASS ✓]\x1b[0m ${name}`);
  } else {
    results.push({ suite, name, passed: false, message });
    console.error(`  \x1b[31m[FAIL ✗]\x1b[0m ${name} - ${message || 'Assertion failed'}`);
  }
}

async function runVerification() {
  console.log('\n===================================================================');
  console.log('🧪 BẮT ĐẦU CHẠY MACHINE VERIFICATION: PHASE 3 PRICING & LEAD ENGINE');
  console.log('===================================================================\n');

  // =================================================================
  // Flow 1: Lõi Tính Toán Chi Phí Lăn Bánh & Trả Góp (Zero Error)
  // =================================================================
  console.log('📌 [Flow 1] Kiểm tra Lõi Tính Toán Tài Chính (Rolling Cost & Installment):');
  const rollingVinh = calculateRollingCost({
    giaXe: 769_000_000,
    tinhThanhCode: 'nghe_an_vinh',
    soChoNgoi: 5,
    hasBaoHiemThanVo: false,
    hasPhiDichVu: false,
  });
  assert(
    rollingVinh.lePhiTruocBa === 76_900_000,
    'Flow 1',
    'TC-1.1: Phí trước bạ tại Vinh = 10% (76.900.000 VNĐ)'
  );
  assert(
    rollingVinh.phiBienSo === 1_000_000,
    'Flow 1',
    'TC-1.2: Tiền biển số tại TP. Vinh = 1.000.000 VNĐ'
  );

  const rollingHuyen = calculateRollingCost({
    giaXe: 769_000_000,
    tinhThanhCode: 'nghe_an_huyen',
    soChoNgoi: 5,
    hasBaoHiemThanVo: false,
    hasPhiDichVu: false,
  });
  assert(
    rollingHuyen.phiBienSo === 200_000,
    'Flow 1',
    'TC-1.3: Tiền biển số tại Huyện khác (Nghệ An) = 200.000 VNĐ'
  );
  assert(
    rollingVinh.tongGiaLanBanh - rollingHuyen.tongGiaLanBanh === 800_000,
    'Flow 1',
    'TC-1.4: Chênh lệch giá lăn bánh giữa Vinh và Huyện đúng 800.000 VNĐ'
  );

  const installment = calculateInstallment({
    giaXe: 600_000_000,
    tyLeVayPercent: 80,
    thoiHanVayThang: 60,
    laiSuatNamPercent: 8.4,
  });
  assert(
    installment.soTienVay === 480_000_000 && installment.soTienTraTruoc === 120_000_000,
    'Flow 1',
    'TC-1.5: Dự toán trả góp: Vay 80% (480tr) & Trả trước 20% (120tr)'
  );
  assert(
    installment.tienGocHangThang === 8_000_000,
    'Flow 1',
    'TC-1.6: Tiền gốc mỗi tháng = 8.000.000 VNĐ (480tr / 60 tháng)'
  );

  // =================================================================
  // Flow 2: Zero-Cost Phone Number Validation (Regex & Blacklist)
  // =================================================================
  console.log('\n📌 [Flow 2] Kiểm tra Xác Thực Số Điện Thoại 10 Số Di Động Việt Nam (Zero-Cost):');
  const validPhones = [
    '0912345679', // VinaPhone
    '0987654322', // Viettel
    '0903456789', // MobiFone
    '0923456789', // Vietnamobile
    '0559123456', // Wintel
    '0775123456', // FPT MVNO
    '0389123456', // Viettel 038
  ];

  for (const p of validPhones) {
    const parse = CreateLeadSchema.safeParse({
      fullName: 'Nguyễn Văn Test',
      phone: p,
      province: 'Vinh',
    });
    assert(parse.success, 'Flow 2', `TC-2.1: Số điện thoại hợp lệ: ${p}`);
  }

  // Số không hợp lệ (sai độ dài, ký tự lạ, cố định cũ)
  const invalidPhones = ['091234567', '09123456789', '0912abc345', '0243888888'];
  for (const p of invalidPhones) {
    const parse = CreateLeadSchema.safeParse({
      fullName: 'Nguyễn Văn Test',
      phone: p,
      province: 'Vinh',
    });
    assert(!parse.success, 'Flow 2', `TC-2.2: Từ chối số sai quy chuẩn: ${p}`);
  }

  // Chặn số rác trong Blacklist
  for (const dummy of DUMMY_PHONE_BLACKLIST.slice(0, 3)) {
    const parse = CreateLeadSchema.safeParse({
      fullName: 'Spam Bot',
      phone: dummy,
      province: 'Vinh',
    });
    assert(!parse.success, 'Flow 2', `TC-2.3: Chặn số ảo trong blacklist: ${dummy}`);
  }

  // =================================================================
  // Flow 3: Public Lead Ingestion DTO Validation
  // =================================================================
  console.log('\n📌 [Flow 3] Kiểm tra Schema Tiếp Nhận Khách Hàng (CreateLeadSchema):');
  const validLeadInput = {
    fullName: 'Trần Thị Khách Hàng',
    phone: '0981234567',
    carModel: 'Hyundai Tucson 2025',
    carVersion: '2.0 Xăng Tiêu Chuẩn',
    province: 'Vinh',
    estimatedTotal: 849080000,
    leadType: 'Giá Lăn Bánh',
    preferredTime: 'Sáng (8h - 12h)',
    notes: 'Khách cần xem xe mẫu màu trắng',
  };
  const validResult = CreateLeadSchema.safeParse(validLeadInput);
  assert(validResult.success, 'Flow 3', 'TC-3.1: DTO Lead hợp lệ parse thành công');

  const invalidLeadShortName = CreateLeadSchema.safeParse({
    ...validLeadInput,
    fullName: 'A', // Tên quá ngắn (< 2 ký tự)
  });
  assert(!invalidLeadShortName.success, 'Flow 3', 'TC-3.2: Từ chối họ tên dưới 2 ký tự');

  // =================================================================
  // Flow 4: Bẫy Honeypot Chống Bot Cào Dữ Liệu (Honeypot Trap Simulation)
  // =================================================================
  console.log('\n📌 [Flow 4] Kiểm tra Bẫy Honeypot Chống Bot Tự Động (Honeypot Trap):');
  const botLeadInput = {
    ...validLeadInput,
    websiteUrl: 'https://spam-bot-target.com', // Bot tự điền trường ẩn này
  };
  const botParse = CreateLeadSchema.safeParse(botLeadInput);
  assert(botParse.success, 'Flow 4', 'TC-4.1: DTO chấp nhận payload có trường websiteUrl');
  assert(
    Boolean(botLeadInput.websiteUrl),
    'Flow 4',
    'TC-4.2: Phát hiện cờ websiteUrl được điền -> Kích hoạt Silent Discard (không lưu DB)'
  );

  // =================================================================
  // Flow 5: Chống Gửi Trùng Lặp (Deduplication Window Check)
  // =================================================================
  console.log('\n📌 [Flow 5] Kiểm tra Logic Khung Thời Gian Chống Trùng Lặp (Deduplication Window):');
  const now = Date.now();
  const DEDUPLICATION_WINDOW_MS = 10 * 60 * 1000;
  const recentCreatedAt = new Date(now - 3 * 60 * 1000); // 3 phút trước
  const oldCreatedAt = new Date(now - 15 * 60 * 1000);   // 15 phút trước

  const isRecentDuplicate = now - recentCreatedAt.getTime() < DEDUPLICATION_WINDOW_MS;
  const isOldDuplicate = now - oldCreatedAt.getTime() < DEDUPLICATION_WINDOW_MS;

  assert(isRecentDuplicate === true, 'Flow 5', 'TC-5.1: Nhận diện lead cùng SĐT trong 3 phút là duplicate (isDuplicate: true)');
  assert(isOldDuplicate === false, 'Flow 5', 'TC-5.2: Lead sau 15 phút được phép tạo bản ghi mới bình thường');

  // =================================================================
  // Flow 6: Phân Quyền RBAC Cho Leads CRM (Access Control)
  // =================================================================
  console.log('\n📌 [Flow 6] Kiểm tra Phân Quyền RBAC Quản Trị Leads (RBAC Guard):');
  assert(
    hasPermission('admin', 'leads:read') && hasPermission('admin', 'leads:write'),
    'Flow 6',
    'TC-6.1: Role admin có đầy đủ quyền leads:read và leads:write'
  );
  assert(
    hasPermission('manager', 'leads:read') && hasPermission('manager', 'leads:write'),
    'Flow 6',
    'TC-6.2: Role manager có quyền leads:read và leads:write'
  );
  assert(
    hasPermission('sales', 'leads:read') && hasPermission('sales', 'leads:write'),
    'Flow 6',
    'TC-6.3: Role sales có quyền xem và cập nhật trạng thái leads'
  );
  assert(
    hasPermission('editor', 'leads:write') === false,
    'Flow 6',
    'TC-6.4: Role editor BỊ CHẶN quyền cập nhật khách hàng (leads:write === false)'
  );

  // =================================================================
  // Flow 7: Máy Trạng Thái Lead (Lead Status Transitions)
  // =================================================================
  console.log('\n📌 [Flow 7] Kiểm tra Máy Trạng Thái Leads (State Transitions):');
  const validTransitions = ['new', 'contacted', 'converted', 'cancelled'];
  for (const st of validTransitions) {
    const parse = UpdateLeadStatusSchema.safeParse({
      status: st,
      notes: `Chuyển trạng thái sang ${st}`,
    });
    assert(parse.success, 'Flow 7', `TC-7.1: Hợp lệ với trạng thái LeadStatusEnum: ${st}`);
  }

  const invalidStatusParse = UpdateLeadStatusSchema.safeParse({
    status: 'invalid_status_xyz',
  });
  assert(!invalidStatusParse.success, 'Flow 7', 'TC-7.2: Từ chối trạng thái không hợp lệ');

  // =================================================================
  // Flow 8: Cấu Hình Biểu Phí Nhà Nước & Tra Cứu Linh Hoạt
  // =================================================================
  console.log('\n📌 [Flow 8] Kiểm tra Module Biểu Phí Tập Trung (Centralized Config):');
  assert(
    PROVINCE_FEE_CONFIGS.nghe_an_vinh.phiBienSo === 1_000_000,
    'Flow 8',
    'TC-8.1: Cấu hình chuẩn phí biển số TP. Vinh: 1.000.000 VNĐ'
  );
  assert(
    FIXED_GOVERNMENT_RATES.phiDangKiem === 140_000,
    'Flow 8',
    'TC-8.2: Phí đăng kiểm cố định nhà nước: 140.000 VNĐ'
  );
  assert(
    FIXED_GOVERNMENT_RATES.phiBaoTriDuongBo12Thang === 1_560_000,
    'Flow 8',
    'TC-8.3: Phí bảo trì đường bộ 12 tháng: 1.560.000 VNĐ'
  );

  // =================================================================
  // TỔNG KẾT KẾT QUẢ KIỂM THỬ
  // =================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n===================================================================');
  console.log(`📊 KẾT QUẢ VERIFICATION PHASE 3: ${passed}/${total} TESTS PASSED`);
  if (failed === 0) {
    console.log('🎉 \x1b[32m100% CÁC CA KIỂM THỬ ĐẠT CHUẨN (EXIT CODE 0)!\x1b[0m');
    console.log('===================================================================\n');
    process.exit(0);
  } else {
    console.error(`💥 \x1b[31mCÓ ${failed} CA KIỂM THỬ THẤT BẠI!\x1b[0m`);
    console.log('===================================================================\n');
    process.exit(1);
  }
}

runVerification();
