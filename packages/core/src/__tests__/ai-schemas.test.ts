import { describe, it, expect } from 'vitest';
import {
  AiActionSchema,
  AiGenerateRequestSchema,
  SiteSettingsSchema,
} from '@cardealer/types';

describe('AI Writing Assistant Schemas & Model Configurations', () => {
  it('TC-AI-1: SiteSettingsSchema chứa openaiApiKey và default model gpt-4o-mini', () => {
    const settings = SiteSettingsSchema.parse({});
    expect(settings.openaiApiKey).toBe('');
    expect(settings.openaiModel).toBe('gpt-4o-mini');

    const customSettings = SiteSettingsSchema.parse({
      openaiApiKey: 'sk-proj-test-12345',
      openaiModel: 'o3-mini',
    });
    expect(customSettings.openaiApiKey).toBe('sk-proj-test-12345');
    expect(customSettings.openaiModel).toBe('o3-mini');
  });

  it('TC-AI-2: AiActionSchema chấp nhận tất cả các action hợp lệ bao gồm generate_full_article', () => {
    const validActions = [
      'generate_full_article',
      'generate_outline',
      'continue_writing',
      'optimize_seo',
      'generate_faqs',
      'expand_section',
      'generate_car_content',
      'generate_single_block',
    ];
    for (const action of validActions) {
      expect(AiActionSchema.parse(action)).toBe(action);
    }
  });

  it('TC-AI-3: AiGenerateRequestSchema validate request tạo dàn ý và toàn bộ bài viết hợp lệ', () => {
    const req = AiGenerateRequestSchema.parse({
      action: 'generate_full_article',
      prompt: 'Đánh giá và giá lăn bánh Hyundai Tucson 2026 tại Nghệ An',
      carModel: 'Hyundai Tucson',
      location: 'Nghệ An',
    });
    expect(req.action).toBe('generate_full_article');
    expect(req.prompt).toBe('Đánh giá và giá lăn bánh Hyundai Tucson 2026 tại Nghệ An');
    expect(req.carModel).toBe('Hyundai Tucson');
    expect(req.location).toBe('Nghệ An');
  });

  it('TC-AI-4: AiGenerateRequestSchema validate request tạo từng khối riêng biệt (generate_single_block)', () => {
    const req = AiGenerateRequestSchema.parse({
      action: 'generate_single_block',
      prompt: 'prosCons',
      context: 'Tiêu đề: Đánh giá Hyundai Santa Fe 2026. Chỉ đạo: tập trung vào cách âm.',
      carModel: 'Hyundai Santa Fe',
      location: 'Nghệ An & Hà Tĩnh',
    });
    expect(req.action).toBe('generate_single_block');
    expect(req.prompt).toBe('prosCons');
    expect(req.context).toContain('cách âm');
  });

  it('TC-AI-5: AiGenerateRequestSchema từ chối prompt rỗng', () => {
    const result = AiGenerateRequestSchema.safeParse({
      action: 'optimize_seo',
      prompt: '   ',
    });
    expect(result.success).toBe(false);
  });
});
