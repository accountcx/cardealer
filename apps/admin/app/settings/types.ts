import { z } from 'zod';

export const settingsSchema = z.object({
  showroomName: z.string().trim().min(1, 'Vui lòng nhập tên showroom'),
  sellerName: z.string().optional(),
  sellerAvatar: z.string().optional(),
  diaChi: z.string().trim().min(1, 'Vui lòng nhập địa chỉ showroom'),
  googleMapsUrl: z.string(),
  hotlineKinhDoanh: z.string().trim().min(1, 'Vui lòng nhập hotline bán hàng'),
  hotlineDichVu: z.string(),
  zaloNumber: z.string().trim().min(1, 'Vui lòng nhập số Zalo kết nối'),
  email: z.string(),
  facebookUrl: z.string(),
  tiktokUrl: z.string(),
  youtubeUrl: z.string(),
  legalBusinessName: z.string().optional(),
  legalBusinessLicense: z.string().optional(),
  legalCopyrightText: z.string().optional(),
  legalBctCertificateUrl: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
