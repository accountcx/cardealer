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
import { posts } from './posts';
import { users } from './users';

// 🧠 Mental Model: Drizzle Schema cho thực thể Leads CRM.
// 1. Enum lead_status_enum quản lý 4 trạng thái chuyển đổi khách hàng: new -> contacted -> converted -> cancelled.
// 2. Index phức hợp (phone, created_at) phục vụ tra cứu lịch sử và chống spam/duplicate trong 10 phút (R1, R3).
// 3. Index phức hợp (status, created_at) phục vụ bộ lọc phân trang Admin CRM Datatable tốc độ cao < 50ms (R13).
// 4. car_version_id liên kết mềm với car_versions (onDelete: 'set null') để đảm bảo không mất lead nếu phiên bản xe bị xóa.
// 5. Mở rộng Phase 5: Hỗ trợ phân bổ nguồn gốc bài viết Inbound (postId, authorId, sourceType, UTM parameters).

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
    carModelInterested: varchar('car_model_interested', { length: 150 }), // Tên dòng xe quan tâm điền từ form nhanh
    province: varchar('province', { length: 100 }).notNull().default('Vinh'),
    estimatedTotal: bigint('estimated_total', { mode: 'number' }),
    status: leadStatusEnum('status').default('new').notNull(),
    notes: text('notes'),
    metadata: jsonb('metadata'),
    // Phân bổ nguồn gốc Inbound Lead Phase 5
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }), // Saler / Tác giả hưởng Lead
    sourceType: varchar('source_type', { length: 50 }).default('web_form'), // inline_quick_form | bottom_bar | slide_in | gated | calculator
    utmSource: varchar('utm_source', { length: 100 }),
    utmMedium: varchar('utm_medium', { length: 100 }),
    utmCampaign: varchar('utm_campaign', { length: 100 }),
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
    index('idx_leads_post_id').on(table.postId),
    index('idx_leads_author_id').on(table.authorId),
  ]
);

export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;
