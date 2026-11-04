// 🧠 Mental Model: Scheduler & Cron Utility Functions (v1.4.0)
// Chuyên trách tính toán, phân giải Cron Expression, đồng bộ khung giờ và
// tự động tái phân bổ lịch xuất bản cho các bài viết đang chờ trong hàng đợi.

export interface ParseCronTimeResult {
  hour: number;
  minute: number;
}

/**
 * Phân tích Cron Expression chuẩn 5 thành phần để trích xuất giờ và phút.
 * Trả về null nếu cron dạng khoảng thời gian (interval) hoặc không có giờ/phút cố định.
 */
export function parseCronTime(cronExpr: string): ParseCronTimeResult | null {
  if (!cronExpr) return null;
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minPart, hourPart] = parts;
  const minute = parseInt(minPart, 10);
  const hour = parseInt(hourPart, 10);

  if (isNaN(minute) || isNaN(hour) || minute < 0 || minute > 59 || hour < 0 || hour > 23) {
    return null;
  }

  return { hour, minute };
}

/**
 * Phân tích một trường của biểu thức Cron (*, số đơn lẻ, dải số, hoặc bước nhảy sao/N)
 */
export function parseCronField(field: string, min: number, max: number): number[] {
  if (field === '*') {
    const res: number[] = [];
    for (let i = min; i <= max; i++) res.push(i);
    return res;
  }

  if (field.startsWith('*/')) {
    const step = parseInt(field.slice(2), 10);
    if (isNaN(step) || step <= 0) return [min];
    const res: number[] = [];
    for (let i = min; i <= max; i += step) res.push(i);
    return res;
  }

  return field
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= min && n <= max);
}

/**
 * Dự đoán danh sách `count` mốc thời gian tiếp theo theo đúng biểu thức Cron chuẩn 5 trường.
 */
export function getNextCronOccurrences(
  cronExpr: string,
  count: number,
  startDate: Date = new Date()
): Date[] {
  if (count <= 0) return [];
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minPart, hourPart, domPart, monPart, dowPart] = parts;
  const validMins = parseCronField(minPart, 0, 59);
  const validHours = parseCronField(hourPart, 0, 23);
  const validDoms = parseCronField(domPart, 1, 31);
  const validMons = parseCronField(monPart, 1, 12);
  const validDows = parseCronField(dowPart, 0, 7).map((d) => (d === 7 ? 0 : d));

  if (validMins.length === 0 || validHours.length === 0 || validMons.length === 0) {
    return [];
  }

  const results: Date[] = [];
  const current = new Date(startDate);
  current.setSeconds(0, 0);
  // Bắt đầu kiểm tra từ phút tiếp theo
  current.setMinutes(current.getMinutes() + 1);

  // Giới hạn tìm kiếm tối đa 365 ngày để bảo vệ tiến trình
  const maxIterations = 365 * 24 * 60;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dom = current.getDate();
    const month = current.getMonth() + 1; // 1-12
    const dow = current.getDay(); // 0-6

    const matchMin = validMins.includes(minute);
    const matchHour = validHours.includes(hour);
    const matchMon = monPart === '*' || validMons.includes(month);
    const matchDom = domPart === '*' || validDoms.includes(dom);
    const matchDow = dowPart === '*' || validDows.includes(dow);

    const matchDay =
      domPart === '*' && dowPart === '*'
        ? true
        : domPart !== '*' && dowPart !== '*'
        ? matchDom || matchDow
        : domPart !== '*'
        ? matchDom
        : matchDow;

    if (matchMin && matchHour && matchMon && matchDay) {
      results.push(new Date(current));
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export interface RescheduleOptions {
  mode: 'time_only' | 'reschedule_all';
  targetHour?: number;
  targetMinute?: number;
  cronExpression?: string;
  referenceDate?: Date;
}

/**
 * Tự động đồng bộ hoặc tái phân bổ ngày xuất bản cho danh sách bài viết đang chờ trong hàng đợi.
 */
export function reschedulePendingItems<T extends { id: string; scheduledAt: Date | string }>(
  items: T[],
  options: RescheduleOptions
): Array<T & { scheduledAt: Date }> {
  if (!items || items.length === 0) return [];
  const ref = options.referenceDate ? new Date(options.referenceDate) : new Date();

  // Chế độ 1: Sắp xếp lại toàn bộ lịch theo chu kỳ Cron mới
  if (options.mode === 'reschedule_all' && options.cronExpression) {
    const nextDates = getNextCronOccurrences(options.cronExpression, items.length, ref);
    return items.map((item, idx) => ({
      ...item,
      scheduledAt: nextDates[idx] || new Date(item.scheduledAt),
    }));
  }

  // Chế độ 2: Chỉ cập nhật giờ:phút đăng bài (giữ nguyên ngày tháng đã lên lịch)
  let h = options.targetHour ?? 8;
  let m = options.targetMinute ?? 0;

  if (options.targetHour === undefined && options.cronExpression) {
    const parsed = parseCronTime(options.cronExpression);
    if (parsed) {
      h = parsed.hour;
      m = parsed.minute;
    }
  }

  return items.map((item) => {
    const orig = new Date(item.scheduledAt);
    const updated = new Date(orig);
    updated.setHours(h, m, 0, 0);

    // Nếu thời gian sau khi điều chỉnh bị rơi vào quá khứ so với ref date:
    // Đẩy sang ngày kế tiếp có khung giờ này để đảm bảo bài viết không bị quá hạn
    if (updated.getTime() <= ref.getTime()) {
      const tomorrow = new Date(ref);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(h, m, 0, 0);
      return {
        ...item,
        scheduledAt: tomorrow,
      };
    }

    return {
      ...item,
      scheduledAt: updated,
    };
  });
}
