import {
  pgTable,
  uuid,
  varchar,
  text,
  bigint,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { carVersions } from './car_versions';

// 🧠 Mental Model: Drizzle Schema cho thực thể Leads CRM.
// 1. Enum lead_status_enum quản lý 4 trạng thái chuyển đổi khách hàng: new -> contacted -> converted -> cancelled.
// 2. Index phức hợp (phone, created_at) phục vụ tra cứu lịch sử và chống spam/duplicate trong 10 phút (R1, R3).
// 3. Index phức hợp (status, created_at) phục vụ bộ lọc phân trang Admin CRM Datatable tốc độ cao < 50ms (R13).
// 4. car_version_id liên kết mềm với car_versions (onDelete: 'set null') để đảm bảo không mất lead nếu phiên bản xe bị xóa.

export const leadStatusEnum = pgEnum('lead_status_enum', [
  'new',        // Mới nhận từ form web
  'contacted',  // Nhân viên sales đã gọi tư vấn
  'converted',  // Đã cọc hoặc mua xe thành công
  'cancelled',  // Hủy yêu cầu hoặc số ảo
]);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 150 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    carVersionId: uuid('car_version_id').references(() => carVersions.id, {
      onDelete: 'set null',
    }),
    province: varchar('province', { length: 100 }).notNull().default('Vinh'),
    estimatedTotal: bigint('estimated_total', { mode: 'number' }),
    status: leadStatusEnum('status').default('new').notNull(),
    notes: text('notes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_leads_phone_created').on(table.phone, table.createdAt),
    index('idx_leads_status_created').on(table.status, table.createdAt),
  ]
);

export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;
