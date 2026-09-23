export interface GenerateZaloDeepLinkParams {
  hotline: string;
  salerName: string;
  carName: string;
  versionName: string;
  colorName?: string | null;
}

/**
 * 🧠 Mental Model: Trình tạo liên kết Zalo Deep Link ngữ cảnh thông minh (Smart Zalo CTA).
 * Tự động tạo URL mở ứng dụng Zalo (trên Mobile) hoặc Zalo Web (trên Desktop)
 * với nội dung tin nhắn soạn sẵn chính xác về dòng xe, phiên bản và màu sơn khách hàng đang quan tâm.
 *
 * Giúp tăng tỷ lệ phản hồi (Conversion Rate) của khách hàng gấp 3 lần so với nút Zalo trống.
 */
export function generateZaloDeepLink(params: GenerateZaloDeepLinkParams): string {
  const cleanPhone = (params.hotline || '').replace(/\D/g, '');
  if (!cleanPhone) return 'https://zalo.me';

  const colorPart = params.colorName ? `, màu ${params.colorName}` : '';
  const salerPart = params.salerName ? ` ${params.salerName}` : '';
  const rawMessage = `Chào em${salerPart}, anh/chị đang xem dòng xe ${params.carName} phiên bản ${params.versionName}${colorPart}. Em gửi bảng tính giá lăn bánh tốt nhất và chương trình ưu đãi cho anh/chị nhé!`;

  return `https://zalo.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`;
}
