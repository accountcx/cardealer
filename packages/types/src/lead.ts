import { z } from 'zod';

// 🧠 Mental Model: Định nghĩa Lead Schemas & Validation Contracts cho toàn bộ hệ thống.
// 1. Regex kiểm tra 10 số di động Việt Nam chuẩn xác bằng logic mã nguồn (Zero-Cost Policy, không tốn phí SMS).
// 2. Enum 'new' | 'contacted' | 'converted' | 'cancelled' khớp 1:1 với Drizzle PostgreSQL DB Enum.
// 3. Tích hợp bẫy Honeypot 'websiteUrl' để chặn spam bot tự động mà không làm phiền người dùng thật.

/**
 * Danh sách số điện thoại rác/ảo kinh điển dùng cho blacklisting
 */
export const DUMMY_PHONE_BLACKLIST = [
  '0900000000',
  '0912345678',
  '0988888888',
  '0999999999',
  '0911111111',
  '0922222222',
  '0933333333',
  '0944444444',
  '0955555555',
  '0966666666',
  '0977777777',
];

/**
 * Trạng thái Lead trong quy trình CRM
 */
export const LeadStatusEnum = z.enum([
  'new',        // Mới nhận từ form web
  'contacted',  // Nhân viên sales đã liên hệ tư vấn
  'converted',  // Đã chốt hợp đồng / đặt cọc
  'cancelled',  // Hủy yêu cầu / Sai số / Khách không có nhu cầu
]);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

/**
 * Nhãn hiển thị tiếng Việt của trạng thái Lead
 */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Mới nhận',
  contacted: 'Đã liên hệ',
  converted: 'Thành công',
  cancelled: 'Hủy / Sai số',
};

/**
 * Hình thức / Nguồn yêu cầu tư vấn của khách hàng
 */
export const LeadTypeEnum = z.enum([
  'Giá Lăn Bánh',
  'Dự Toán Trả Góp',
  'Báo Giá',
  'Lái Thử',
  'Liên Hệ',
]);
export type LeadType = z.infer<typeof LeadTypeEnum>;

/**
 * Schema tiếp nhận Lead từ Storefront (Public Ingestion API)
 */
export const CreateLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ (Phải là 10 chữ số đầu 03, 05, 07, 08, 09)')
    .refine((val) => !DUMMY_PHONE_BLACKLIST.includes(val), {
      message: 'Vui lòng nhập số điện thoại đang hoạt động thực tế',
    }),
  carVersionId: z.string().uuid().optional().nullable(),
  carModel: z.string().optional(),
  carVersion: z.string().optional(),
  province: z.string().default('Vinh'),
  estimatedTotal: z.number().nonnegative().optional().nullable(),
  leadType: LeadTypeEnum.default('Giá Lăn Bánh'),
  preferredTime: z
    .enum(['Sáng (8h - 12h)', 'Chiều (13h - 18h)', 'Bất kỳ'])
    .optional()
    .default('Bất kỳ'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // 🧠 Mental Model: Bẫy bot (Honeypot field). Trường này ẩn trên giao diện; nếu bot tự điền sẽ bị âm thầm loại bỏ.
  websiteUrl: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

/**
 * Schema cập nhật trạng thái Lead dành cho Admin CRM
 */
export const UpdateLeadStatusSchema = z.object({
  status: LeadStatusEnum,
  notes: z.string().max(1000).optional(),
});
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>;

/**
 * Schema chi tiết Lead trả về cho Client/Admin
 */
export const LeadResponseSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  phone: z.string(),
  carVersionId: z.string().uuid().nullable().optional(),
  province: z.string(),
  estimatedTotal: z.number().nullable().optional(),
  status: LeadStatusEnum,
  notes: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LeadResponse = z.infer<typeof LeadResponseSchema>;
