import { z } from 'zod';

export const LeadTypeEnum = z.enum([
  'Báo Giá',
  'Trả Góp',
  'Giá Lăn Bánh',
  'Lái Thử',
  'Event Lead',
  'Liên Hệ',
]);
export type LeadType = z.infer<typeof LeadTypeEnum>;

export const LeadStatusEnum = z.enum([
  'Mới',
  'Đã liên hệ',
  'Tiềm năng',
  'Đã chốt',
  'Hủy',
]);
export type LeadStatus = z.infer<typeof LeadStatusEnum>;

export const LeadSubmissionSchema = z.object({
  hoTen: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  soDienThoai: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  dongXeQuanTam: z.string().optional(),
  hinhThuc: LeadTypeEnum.default('Báo Giá'),
  tinhThanh: z.string().optional(),
  ghiChu: z.string().optional(),
});
export type LeadSubmission = z.infer<typeof LeadSubmissionSchema>;

export const LeadRecordSchema = LeadSubmissionSchema.extend({
  id: z.string(),
  trangThai: LeadStatusEnum.default('Mới'),
  createdAt: z.string(),
});
export type LeadRecord = z.infer<typeof LeadRecordSchema>;
