import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';
import { db, schema } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import {
  type LeadEmailPayload,
  generateLeadNotificationHtml,
  buildLeadNotificationSubject,
} from '@cardealer/core';

export { type LeadEmailPayload, generateLeadNotificationHtml, buildLeadNotificationSubject };

// 🧠 Mental Model: Dịch vụ Email Dispatcher gửi thông báo Lead tức thì (Instant Lead Notification).
// 1. Ưu tiên hàng đầu: Resend SDK (`RESEND_API_KEY`). Nhanh, bảo mật HTTPS REST API, không bị chặn cổng mạng (587/465).
// 2. Fallback cấp 2: SMTP Transport qua Nodemailer (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) với Connection Pooling.
// 3. Fallback cấp 3: Simulated Mode (môi trường dev/test khi chưa cấu hình Resend hoặc SMTP), ghi log sạch, không crash hệ thống.
// 4. Tự động lấy email nhận từ: biến môi trường LEAD_NOTIFICATION_EMAIL -> contact_settings trong DB -> fallback mặc định.
// 5. Resilient & Non-blocking: Bọc try/catch tách biệt, không bao giờ ném unhandled error làm gián đoạn API tiếp nhận khách hàng.

export type EmailServiceMode = 'resend' | 'smtp' | 'simulated';

export class EmailService {
  private resendClient: Resend | null = null;
  private smtpTransporter: Transporter | null = null;
  private mode: EmailServiceMode = 'simulated';

  constructor() {
    this.init();
  }

  public init(): void {
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    if (resendApiKey) {
      try {
        this.resendClient = new Resend(resendApiKey);
        this.mode = 'resend';
        console.log('[Email Service] Resend Client đã sẵn sàng.');
        return;
      } catch (err) {
        console.error('[Email Service] Lỗi khởi tạo Resend Client:', err);
      }
    }

    // Fallback: SMTP Transport qua Nodemailer
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
          pool: true,
          maxConnections: 3,
          maxMessages: 100,
        });
        this.mode = 'smtp';
        console.log(`[Email Service] SMTP Transport đã sẵn sàng: ${host}:${port}`);
        return;
      } catch (err) {
        console.error('[Email Service] Lỗi khởi tạo SMTP Transport:', err);
      }
    }

    this.mode = 'simulated';
  }

  public getMode(): EmailServiceMode {
    return this.mode;
  }

  /**
   * Phân giải địa chỉ email nhận thông báo Lead
   */
  public async resolveRecipientEmail(): Promise<string> {
    if (process.env.LEAD_NOTIFICATION_EMAIL && process.env.LEAD_NOTIFICATION_EMAIL.trim()) {
      return process.env.LEAD_NOTIFICATION_EMAIL.trim();
    }

    // Fallback: Tìm trong bảng system_settings key 'contact_settings'
    try {
      const contactRow = await db.query.systemSettings.findFirst({
        where: eq(schema.systemSettings.key, 'contact_settings'),
      });
      if (contactRow?.data && typeof contactRow.data === 'object') {
        const contactData = contactRow.data as Record<string, unknown>;
        if (contactData.email && typeof contactData.email === 'string' && contactData.email.includes('@')) {
          return contactData.email.trim();
        }
      }
    } catch {
      // Ignored: Fallback tiếp theo
    }

    return 'admin@xehyundaivinh.com';
  }

  /**
   * Gửi email thông báo khi có khách hàng gửi Form Lead mới (Non-blocking & Safe)
   */
  public async sendLeadNotification(lead: LeadEmailPayload): Promise<boolean> {
    const recipient = await this.resolveRecipientEmail();
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://cms.xehyundaivinh.com';
    const htmlContent = generateLeadNotificationHtml(lead, adminUrl);
    const subject = buildLeadNotificationSubject(lead);

    // Chế độ 1: Simulated Mode (khi chưa cấu hình Resend hoặc SMTP)
    if (this.mode === 'simulated') {
      console.log(
        `[Email Notification - Simulated] Chưa cấu hình Resend hoặc SMTP. Mô phỏng gửi email thông báo Lead tới: ${recipient} (Khách: ${lead.fullName}, SĐT: ${lead.phone})`
      );
      return true;
    }

    // Chế độ 2: Gửi qua Resend SDK (Ưu tiên hàng đầu)
    if (this.mode === 'resend' && this.resendClient) {
      try {
        const fromAddress =
          process.env.RESEND_FROM?.trim() ||
          'Hyundai Vinh Showroom <onboarding@resend.dev>';

        const sendResult = await this.resendClient.emails.send({
          from: fromAddress,
          to: [recipient],
          subject,
          html: htmlContent,
        });

        if (sendResult.error) {
          console.error(
            `[Email Notification - Resend Error] Không thể gửi tới ${recipient}:`,
            sendResult.error
          );
          return false;
        }

        console.log(
          `[Email Notification - Resend] Đã gửi thông báo Lead thành công (ID: ${sendResult.data?.id}) tới: ${recipient}`
        );
        return true;
      } catch (err: unknown) {
        console.error(
          `[Email Notification - Resend Exception] Lỗi khi gửi tới ${recipient}:`,
          err instanceof Error ? err.message : String(err)
        );
        return false;
      }
    }

    // Chế độ 3: Fallback qua SMTP (Nodemailer)
    if (this.mode === 'smtp' && this.smtpTransporter) {
      try {
        const fromAddress =
          process.env.SMTP_FROM ||
          `"Hyundai Vinh Showroom" <${process.env.SMTP_USER || 'no-reply@xehyundaivinh.com'}>`;

        await this.smtpTransporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject,
          html: htmlContent,
        });

        console.log(`[Email Notification - SMTP] Đã gửi thông báo Lead thành công tới: ${recipient}`);
        return true;
      } catch (err: unknown) {
        console.error(
          `[Email Notification - SMTP Error] Không thể gửi email thông báo Lead tới ${recipient}:`,
          err instanceof Error ? err.message : String(err)
        );
        return false;
      }
    }

    return false;
  }
}

export const emailService = new EmailService();
