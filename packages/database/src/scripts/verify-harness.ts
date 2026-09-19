import { performance } from 'perf_hooks';

// 🧠 Mental Model: Test Runner Harness phục vụ Machine Verification CLI.
// Tách biệt cơ chế thống kê, in màu terminal và bắt lỗi khỏi nội dung test case (tuân thủ SRP).

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export class TestHarness {
  private total = 0;
  private passed = 0;
  private failed = 0;
  private startTime: number;

  constructor(private suiteTitle: string) {
    this.startTime = performance.now();
    console.log(`\n${BOLD}🚀 BẮT ĐẦU KIỂM CHỨNG TỰ ĐỘNG: ${this.suiteTitle}${RESET}`);
    console.log(`   Thời gian thực thi: ${new Date().toLocaleString('vi-VN')}`);
  }

  logSection(title: string) {
    console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
    console.log(`${BOLD}${CYAN} ${title}${RESET}`);
    console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  }

  test(name: string, fn: () => void | boolean) {
    this.total++;
    try {
      const res = fn();
      if (res === false) throw new Error('Assertion returned false');
      this.passed++;
      console.log(`  ${GREEN}✔ [PASS]${RESET} ${name}`);
    } catch (err: unknown) {
      this.failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ${RED}✖ [FAIL]${RESET} ${name}`);
      console.error(`     ${RED}Reason: ${msg}${RESET}`);
    }
  }

  finalize() {
    const duration = ((performance.now() - this.startTime) / 1000).toFixed(2);
    this.logSection('BÁO CÁO NGHIỆM THU KIỂM CHỨNG TỰ ĐỘNG (VERIFICATION REPORT)');

    console.log(`\n  Tổng số Test Cases: ${BOLD}${this.total}${RESET}`);
    console.log(`  Số bài kiểm tra thành công: ${GREEN}${BOLD}${this.passed} ✔ PASS${RESET}`);
    console.log(`  Số bài kiểm tra thất bại:   ${this.failed === 0 ? GREEN : RED}${BOLD}${this.failed} ✖ FAIL${RESET}`);
    console.log(`  Tổng thời gian thực thi:    ${CYAN}${duration} giây${RESET}\n`);

    if (this.failed === 0) {
      console.log(`${BOLD}${GREEN}🎉 CHÚC MÙNG! TOÀN BỘ CÁC BỘ KIỂM THỬ ĐÃ VƯỢT QUA 100% TIÊU CHUẨN!${RESET}`);
      console.log(`${BOLD}${GREEN}   Sẵn sàng thông quan Gate 4 và tiến vào Giai đoạn 5 (Code Review).${RESET}\n`);
      process.exit(0);
    } else {
      console.error(`${BOLD}${RED}🚨 PHÁT HIỆN ${this.failed} BÀI KIỂM THỬ THẤT BẠI. VUI LÒNG KIỂM TRA LẠI CODE!${RESET}\n`);
      process.exit(1);
    }
  }
}
