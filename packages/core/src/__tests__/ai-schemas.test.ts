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

  it('TC-AI-2: AiActionSchema chấp nhận tất cả các action hợp lệ', () => {
    const validActions = [
      'generate_outline',
      'continue_writing',
      'optimize_seo',
      'generate_faqs',
      'expand_section',
    ];
    for (const action of validActions) {
      expect(AiActionSchema.parse(action)).toBe(action);
    }
  });

  it('TC-AI-3: AiGenerateRequestSchema validate request tạo dàn ý hợp lệ', () => {
    const req = AiGenerateRequestSchema.parse({
      action: 'generate_outline',
      prompt: 'Giá lăn bánh Accent 2026 tại Nghệ An',
      carModel: 'Hyundai Accent',
      location: 'Nghệ An',
    });
    expect(req.action).toBe('generate_outline');
    expect(req.prompt).toBe('Giá lăn bánh Accent 2026 tại Nghệ An');
    expect(req.carModel).toBe('Hyundai Accent');
    expect(req.location).toBe('Nghệ An');
  });

  it('TC-AI-4: AiGenerateRequestSchema từ chối prompt rỗng', () => {
    const result = AiGenerateRequestSchema.safeParse({
      action: 'optimize_seo',
      prompt: '   ',
    });
    expect(result.success).toBe(false);
  });
});
