import { z } from 'zod';

export const ContentPlanStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type ContentPlanStatus = z.infer<typeof ContentPlanStatusSchema>;

// 1. Auto Post Settings
export const AutoPostSettingsSchema = z.object({
  id: z.string().default('default'),
  isEnabled: z.boolean().default(false),
  cronExpression: z.string().default('0 8 * * *'),
  defaultStatus: z.enum(['draft', 'published']).default('draft'),
  defaultCategoryId: z.string().uuid().nullable().optional(),
  defaultAuthorId: z.string().uuid().nullable().optional(),
  nextRunTime: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type AutoPostSettings = z.infer<typeof AutoPostSettingsSchema>;

export const UpdateAutoPostSettingsInputSchema = z.object({
  isEnabled: z.boolean(),
  cronExpression: z.string().min(1, 'Cron expression không được để trống'),
  defaultStatus: z.enum(['draft', 'published']),
  defaultCategoryId: z.string().uuid().nullable().optional(),
  defaultAuthorId: z.string().uuid().nullable().optional(),
  syncPendingQueue: z.boolean().optional().default(true),
  syncMode: z.enum(['time_only', 'reschedule_all']).optional().default('reschedule_all'),
  targetTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});
export type UpdateAutoPostSettingsInput = z.infer<typeof UpdateAutoPostSettingsInputSchema>;

export const SyncQueueInputSchema = z.object({
  syncMode: z.enum(['time_only', 'reschedule_all']).optional().default('reschedule_all'),
  targetTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  cronExpression: z.string().optional(),
});
export type SyncQueueInput = z.infer<typeof SyncQueueInputSchema>;

// 2. Content Plan Items
export const ContentPlanItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5, 'Tiêu đề bài viết kế hoạch tối thiểu 5 ký tự'),
  slug: z.string().nullable().optional(),
  focusKeyword: z.string().min(2, 'Từ khóa chính không được để trống'),
  categoryId: z.string().uuid().nullable().optional(),
  targetCar: z.string().nullable().optional(),
  angle: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  scheduledAt: z.coerce.date(),
  status: ContentPlanStatusSchema.default('pending'),
  postId: z.string().uuid().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categoryName: z.string().optional(),
});
export type ContentPlanItem = z.infer<typeof ContentPlanItemSchema>;

export const CreateContentPlanItemInputSchema = z.object({
  title: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự'),
  focusKeyword: z.string().min(2, 'Từ khóa chính tối thiểu 2 ký tự'),
  categoryId: z.string().uuid().nullable().optional(),
  targetCar: z.string().nullable().optional(),
  angle: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  scheduledAt: z.coerce.date(),
});
export type CreateContentPlanItemInput = z.infer<typeof CreateContentPlanItemInputSchema>;

export const UpdateContentPlanItemInputSchema = CreateContentPlanItemInputSchema.partial().extend({
  status: ContentPlanStatusSchema.optional(),
});
export type UpdateContentPlanItemInput = z.infer<typeof UpdateContentPlanItemInputSchema>;

// 3. Auto Post Logs
export const AutoPostLogSchema = z.object({
  id: z.string().uuid(),
  triggerType: z.enum(['cron', 'manual_run_now']),
  planItemId: z.string().uuid().nullable().optional(),
  postId: z.string().uuid().nullable().optional(),
  postTitle: z.string().nullable().optional(),
  status: z.enum(['success', 'failed']),
  errorMessage: z.string().nullable().optional(),
  executionTimeMs: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
});
export type AutoPostLog = z.infer<typeof AutoPostLogSchema>;

// 4. AI Editorial Planner
export const EditorialPlanItemSchema = z.object({
  title: z.string().min(5),
  focusKeyword: z.string().min(2),
  targetCar: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  angle: z.string().min(3),
  summary: z.string().min(10),
  suggestedDay: z.number().int().min(1).max(31).optional(),
  scheduledAt: z.coerce.date().optional(),
});
export type EditorialPlanItem = z.infer<typeof EditorialPlanItemSchema>;

export const GenerateEditorialPlanRequestSchema = z.object({
  targetMonthCount: z.number().int().min(1).max(31).default(12),
  categoryId: z.string().uuid().optional().nullable(),
  targetCar: z.string().optional().nullable(),
});
export type GenerateEditorialPlanRequest = z.infer<typeof GenerateEditorialPlanRequestSchema>;

export const IngestPlanRequestSchema = z.object({
  items: z.array(CreateContentPlanItemInputSchema).min(1, 'Cần ít nhất 1 mục để nạp vào hàng đợi'),
});
export type IngestPlanRequest = z.infer<typeof IngestPlanRequestSchema>;
