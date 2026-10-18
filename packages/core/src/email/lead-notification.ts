import { formatVND } from '../formatters/currency';

// 🧠 Mental Model: Định nghĩa payload & template HTML thông báo khách hàng gửi Yêu cầu Báo Giá & Hồ Sơ Vay.
// Thiết kế responsive luxury tối ưu cho Outlook, Apple Mail, Gmail (hỗ trợ Light & Dark theme email client).
// Toàn bộ dữ liệu hiển thị được mã hóa (sanitized) tránh HTML Injection.

export interface LeadEmailPayload {
  id: string;
  fullName: string;
  phone: string;
  province?: string | null;
  carModel?: string | null;
  carVersion?: string | null;
  estimatedTotal?: number | null;
  leadType?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
}

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatLeadCurrency(amount?: number | null): string {
  if (!amount || amount <= 0) return 'Chưa có dự toán';
  return formatVND(amount);
}

export function buildLeadNotificationSubject(lead: LeadEmailPayload): string {
  const safeName = lead.fullName?.trim() || 'Khách hàng';
  const model = lead.carModel?.trim() || 'Hyundai';
  const safePhone = lead.phone?.trim() || '';
  return `[HYUNDAI VINH CRM] 🚗 Khách mới: ${safeName} - ${model} (${safePhone})`;
}

export function generateLeadNotificationHtml(
  lead: LeadEmailPayload,
  adminUrl = 'https://cms.xehyundaivinh.com'
): string {
  const safeName = escapeHtml(lead.fullName) || 'Khách hàng';
  const safePhone = escapeHtml(lead.phone);
  const safeProvince = escapeHtml(lead.province) || 'Chưa cập nhật';
  const safeCarModel = escapeHtml(lead.carModel) || 'Chưa chọn mẫu xe';
  const safeCarVersion = escapeHtml(lead.carVersion);
  const safeLeadType = escapeHtml(lead.leadType) || 'Báo giá xe';
  const safePreferredTime = escapeHtml(lead.preferredTime) || 'Càng sớm càng tốt';
  const safeNotes = escapeHtml(lead.notes) || 'Không có ghi chú thêm';
  const formattedPrice = formatLeadCurrency(lead.estimatedTotal);
  const adminDetailLink = `${adminUrl}/leads?highlight=${encodeURIComponent(lead.id)}`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khách Hàng Mới - ${safeLeadType}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b192c 0%, #1e3e62 100%); padding: 32px 28px; text-align: left;">
              <span style="display: inline-block; background-color: #002c5f; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                ⚡ THÔNG BÁO LEAD MỚI
              </span>
              <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 22px; font-weight: 700; line-height: 1.3;">
                ${safeLeadType}: ${safeName}
              </h1>
              <p style="color: #93c5fd; margin: 0; font-size: 13px;">
                Đã ghi nhận yêu cầu vào hệ thống CRM lúc ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
              </p>
            </td>
          </tr>

          <!-- Quick Action Bar -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 13px; color: #64748b;">Số điện thoại khách hàng:</span><br/>
                    <a href="tel:${safePhone}" style="font-size: 18px; font-weight: 700; color: #0284c7; text-decoration: none;">
                      📞 ${safePhone}
                    </a>
                  </td>
                  <td align="right">
                    <a href="${adminDetailLink}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px; box-shadow: 0 2px 4px rgba(2,132,199,0.3);">
                      Xem Trên CRM &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer & Car Details -->
          <tr>
            <td style="padding: 24px 28px;">
              <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-left: 3px solid #0284c7; padding-left: 10px;">
                Chi Tiết Yêu Cầu
              </h2>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6;">
                <tr>
                  <td width="35%" style="padding: 8px 0; color: #64748b; font-weight: 500;">Họ và tên:</td>
                  <td width="65%" style="padding: 8px 0; color: #0f172a; font-weight: 600;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500; border-top: 1px dashed #f1f5f9;">Tỉnh / Thành phố:</td>
                  <td style="padding: 8px 0; color: #0f172a; border-top: 1px dashed #f1f5f9;">${safeProvince}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500; border-top: 1px dashed #f1f5f9;">Dòng xe quan tâm:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-top: 1px dashed #f1f5f9;">
                    ${safeCarModel}${safeCarVersion ? ` (${safeCarVersion})` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500; border-top: 1px dashed #f1f5f9;">Dự toán / Giá trị:</td>
                  <td style="padding: 8px 0; color: #0284c7; font-weight: 700; border-top: 1px dashed #f1f5f9;">${formattedPrice}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500; border-top: 1px dashed #f1f5f9;">Thời gian liên hệ:</td>
                  <td style="padding: 8px 0; color: #0f172a; border-top: 1px dashed #f1f5f9;">${safePreferredTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500; border-top: 1px dashed #f1f5f9;">Ghi chú / Nhu cầu:</td>
                  <td style="padding: 8px 0; color: #475569; border-top: 1px dashed #f1f5f9; font-style: italic;">"${safeNotes}"</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 6px 0;">
                Email tự động được gửi từ hệ thống <strong>Hyundai Dũng Lạc - Nghệ An</strong>
              </p>
              <p style="margin: 0;">
                Vui lòng xử lý khách hàng trong vòng <strong>15 phút</strong> để tăng tỷ lệ chốt đơn!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
