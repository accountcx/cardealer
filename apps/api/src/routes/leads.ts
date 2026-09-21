import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { CreateLeadSchema } from '@cardealer/types';
import { eq, and, gt, desc } from 'drizzle-orm';

// 🧠 Mental Model: Public Lead Ingestion Router (POST /api/leads).
// 1. Rate Limiting (R1): In-memory Map theo IP, giới hạn tối đa 5 requests / 60 giây. Vượt ngưỡng trả về HTTP 429.
// 2. Zero-Cost Honeypot Trap (R1): Nếu field 'websiteUrl' được điền (bởi bot cào dữ liệu), trả về thành công giả lập và KHÔNG lưu vào DB.
// 3. Deduplication Window (R3): Chống gửi đúp / spam click. Cùng 1 SĐT gửi cùng 1 phiên bản xe trong vòng 10 phút sẽ trả về bản ghi cũ kèm cờ 'isDuplicate: true'.
// 4. Zero-Cost Phone Regex (R2): Validate 10 số di động VN bắt đầu bằng 03, 05, 07, 08, 09 và chặn blacklist số ảo hoàn toàn bằng Zod/TypeScript.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const DEDUPLICATION_WINDOW_MS = 10 * 60 * 1000; // 10 phút

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function handleLeadRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  // POST /api/leads: Tiếp nhận thông tin khách hàng từ Storefront
  if (url.pathname === '/api/leads' && req.method === 'POST') {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // 1. Kiểm tra Rate Limiter (R1)
    if (!checkRateLimit(clientIp)) {
      sendJson(429, {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Bạn đã gửi yêu cầu quá nhanh. Chuyên viên của chúng tôi sẽ liên hệ trong giây lát!',
        },
      });
      return true;
    }

    try {
      const rawBody = await readBody();

      // 2. Bẫy Honeypot Bot (R1)
      if (rawBody.websiteUrl || rawBody.website_url) {
        console.warn(`[Lead Honeypot] Phát hiện bot spam từ IP: ${clientIp.replace(/[\r\n]/g, '')}`);
        // Giả lập thành công để đánh lừa bot
        sendJson(200, {
          success: true,
          data: {
            id: 'bot-discarded',
            message: 'Yêu cầu của bạn đã được ghi nhận thành công!',
          },
        });
        return true;
      }

      // 3. Xác thực DTO qua Zod Schema (R2)
      const parseResult = CreateLeadSchema.safeParse(rawBody);
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ';
        sendJson(400, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError,
            details: parseResult.error.issues,
          },
        });
        return true;
      }

      const validated = parseResult.data;

      // 4. Kiểm tra Chống Trùng Lặp trong 10 phút (R3 Deduplication)
      const tenMinutesAgo = new Date(Date.now() - DEDUPLICATION_WINDOW_MS);
      const existingRecentLead = await db.query.leads.findFirst({
        where: and(
          eq(schema.leads.phone, validated.phone),
          gt(schema.leads.createdAt, tenMinutesAgo)
        ),
        orderBy: [desc(schema.leads.createdAt)],
      });

      if (existingRecentLead) {
        sendJson(200, {
          success: true,
          data: {
            ...existingRecentLead,
            isDuplicate: true,
            message: 'Yêu cầu của bạn đã được ghi nhận trước đó. Chuyên viên sẽ gọi điện cho bạn ngay!',
          },
        });
        return true;
      }

      // 5. Lưu bản ghi Lead vào PostgreSQL (Drizzle ORM)
      const metadataToSave: Record<string, unknown> = {
        ...(validated.metadata || {}),
        carModel: validated.carModel || validated.carInterest,
        carVersion: validated.carVersion,
        leadType: validated.leadType,
        preferredTime: validated.preferredTime || validated.preferredContactTime,
        ipAddress: clientIp,
      };

      const [newLead] = await db
        .insert(schema.leads)
        .values({
          fullName: validated.fullName,
          phone: validated.phone,
          carVersionId: validated.carVersionId || null,
          province: validated.province || 'Vinh',
          estimatedTotal: validated.estimatedTotal || null,
          status: 'new',
          notes: validated.notes || null,
          metadata: metadataToSave,
        })
        .returning();

      sendJson(201, {
        success: true,
        data: newLead,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi máy chủ nội bộ khi xử lý tiếp nhận khách hàng';
      console.error('[Lead Ingestion Error]:', msg);
      sendJson(500, {
        success: false,
        error: { code: 'SERVER_ERROR', message: msg },
      });
      return true;
    }
  }

  return false;
}
