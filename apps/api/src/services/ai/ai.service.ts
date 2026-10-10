import { db, schema } from '@cardealer/database';
import { eq } from 'drizzle-orm';
import {
  SiteSettingsSchema,
  type AiGenerateRequest,
  type AiGenerateResponseData,
} from '@cardealer/types';
import type {
  LocationProfile,
  SegmentProfile,
  CarVersionInput,
  PricingCalculation,
  TransformContext,
  ExistingCarArticleSummary,
} from './ai.types';
import { LOCAL_PROFILES, SEGMENT_PROFILES, calculateCarPricing } from './domain-knowledge';
import { buildPrompt } from './prompt-builder';
import { callOpenAiWithResilience, OpenAiClientError } from './openai-client';
import { transformAiResponse } from './response-transformer';

export class AiServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

interface DbCarWithArticleAndVersions {
  id: string;
  tenXe: string;
  slug: string;
  segment?: string | null;
  moTaChung?: string | null;
  versions?: Array<{
    tenPhienBan: string;
    giaNiemYet: number | string;
    giaKhuyenMai?: number | string | null;
  }>;
  article?: {
    id: string;
    tieuDe: string;
    tomTat?: string | null;
    focusKeyword?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    status: string;
  } | null;
}

export class AiService {
  // WHY: Lấy API Key và Model cấu hình từ cơ sở dữ liệu hệ thống (site_settings) hoặc biến môi trường.
  private async getOpenAiConfig(): Promise<{ apiKey: string; model: string }> {
    const siteSettingsRow = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, 'site_settings'),
    });

    const siteSettings = siteSettingsRow ? SiteSettingsSchema.parse(siteSettingsRow.data) : SiteSettingsSchema.parse({});
    const apiKey = siteSettings.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || '';
    const model = siteSettings.openaiModel?.trim() || 'gpt-4o-mini';

    return { apiKey, model };
  }

  // WHY: Tự động truy vấn Dữ liệu xe, các Phiên bản và Bài viết đã có của các dòng xe từ Database nhằm chống trùng lặp SEO (Anti-Cannibalization).
  private async queryCarData(
    targetCar: string,
    carSlug?: string
  ): Promise<{
    dbCarRecord: DbCarWithArticleAndVersions | null;
    dbVersions: CarVersionInput[];
    existingArticles: ExistingCarArticleSummary[];
  }> {
    let dbCarRecord: DbCarWithArticleAndVersions | null = null;
    let dbVersions: CarVersionInput[] = [];
    const existingArticles: ExistingCarArticleSummary[] = [];

    try {
      const allCars = (await db.query.cars.findMany({
        with: {
          versions: true,
          article: true,
        },
      })) as DbCarWithArticleAndVersions[];

      const normTarget = targetCar.toLowerCase();
      const normSlug = carSlug ? carSlug.toLowerCase().trim() : '';

      dbCarRecord =
        allCars.find(
          (c) =>
            (normSlug && (c.slug.toLowerCase() === normSlug || normSlug.includes(c.slug.toLowerCase()))) ||
            c.tenXe.toLowerCase().includes(normTarget) ||
            normTarget.includes(c.tenXe.toLowerCase()) ||
            c.slug.toLowerCase().includes(normTarget) ||
            normTarget.includes(c.slug.toLowerCase())
        ) || null;

      if (dbCarRecord && Array.isArray(dbCarRecord.versions)) {
        dbVersions = dbCarRecord.versions.map((v) => ({
          tenPhienBan: v.tenPhienBan,
          giaNiemYet: Number(v.giaNiemYet),
          giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
        }));
      }

      // 1. Trích xuất bài viết đã có của các dòng xe khác trong showroom
      for (const car of allCars) {
        if (dbCarRecord && car.slug === dbCarRecord.slug) continue;
        if (car.article && car.article.tieuDe) {
          existingArticles.push({
            carName: car.tenXe,
            carSlug: car.slug,
            segment: car.segment || undefined,
            title: car.article.tieuDe,
            focusKeyword: car.article.focusKeyword || undefined,
            summary: car.article.tomTat || undefined,
            sourceType: 'car_article',
          });
        }
      }

      // 2. Lấy thêm các bài viết đã xuất bản từ bảng posts để bao quát toàn bộ nội dung website
      const recentPosts = await db.query.posts.findMany({
        where: eq(schema.posts.status, 'published'),
        limit: 5,
        columns: {
          tieuDe: true,
          slug: true,
          focusKeyword: true,
          tomTat: true,
        },
      });

      for (const post of recentPosts) {
        if (!existingArticles.some((ea) => ea.title === post.tieuDe)) {
          existingArticles.push({
            carName: 'Bài viết tin tức/chuyên đề',
            carSlug: post.slug,
            title: post.tieuDe,
            focusKeyword: post.focusKeyword || undefined,
            summary: post.tomTat || undefined,
            sourceType: 'post',
          });
        }
      }
    } catch (err: unknown) {
      console.warn('[AI Service] Không thể truy vấn bài viết các dòng xe từ DB, dùng thông tin đầu vào:', err);
    }

    return { dbCarRecord, dbVersions, existingArticles };
  }

  // WHY: Xác định phân khúc xe dựa trên segment trong database hoặc tên dòng xe.
  private detectSegment(targetCar: string, dbCarRecord: DbCarWithArticleAndVersions | null): SegmentProfile {
    const carSegmentKey =
      (dbCarRecord?.segment as keyof typeof SEGMENT_PROFILES) ||
      (targetCar.toLowerCase().includes('custin') || targetCar.toLowerCase().includes('stargazer')
        ? 'mpv'
        : targetCar.toLowerCase().includes('accent') || targetCar.toLowerCase().includes('elantra')
        ? 'sedan'
        : targetCar.toLowerCase().includes('i10')
        ? 'hatchback'
        : targetCar.toLowerCase().includes('ioniq')
        ? 'ev'
        : 'suv');

    return SEGMENT_PROFILES[carSegmentKey] || SEGMENT_PROFILES.suv;
  }

  // WHY: Phương thức điều phối chính (Orchestrator) thực thi toàn bộ quy trình AI Content Generation.
  public async generate(request: AiGenerateRequest): Promise<AiGenerateResponseData> {
    const { action, prompt, context, keyword, carModel, carSlug, location, availableCars, maxTokens } = request;

    const targetLocation = location || 'Nghệ An & Hà Tĩnh';
    const targetCar = carModel || 'Xe ô tô Hyundai';
    const targetKeyword =
      keyword || (prompt.length > 5 && prompt.length < 50 ? prompt : `Đánh giá ${targetCar} tại ${targetLocation}`);

    // 1. Xác định Location Profile
    const locKey = targetLocation.toLowerCase().includes('hà tĩnh') ? 'ha-tinh' : 'nghe-an';
    const locProfile: LocationProfile = LOCAL_PROFILES[locKey] || LOCAL_PROFILES['nghe-an'];

    // 2. Truy vấn dữ liệu thực tế từ Database & Bài viết các dòng xe
    const { dbCarRecord, dbVersions, existingArticles } = await this.queryCarData(targetCar, carSlug);
    const segmentProfile = this.detectSegment(targetCar, dbCarRecord);

    const effectiveVersions: CarVersionInput[] =
      dbVersions.length > 0
        ? dbVersions
        : [
            { tenPhienBan: `${targetCar} Bản Tiêu Chuẩn`, giaNiemYet: 550000000, giaKhuyenMai: null },
            { tenPhienBan: `${targetCar} Bản Đặc Biệt`, giaNiemYet: 650000000, giaKhuyenMai: null },
            { tenPhienBan: `${targetCar} Bản Cao Cấp`, giaNiemYet: 750000000, giaKhuyenMai: null },
          ];

    const calculatedPricing: PricingCalculation = calculateCarPricing(effectiveVersions, locProfile);

    // 3. Nạp cấu hình OpenAI
    const { apiKey, model } = await this.getOpenAiConfig();

    if (!apiKey) {
      throw new AiServiceError(
        'Chưa cấu hình OpenAI API Key trong Cài đặt Hệ thống. Vui lòng vào Cài đặt -> SEO & Tracking -> OpenAI API Key để nhập key.',
        'OPENAI_API_KEY_MISSING',
        400
      );
    }

    // 4. Xây dựng Prompt (tích hợp danh sách bài viết các dòng xe để chống trùng lặp SEO)
    const { systemPrompt, userPrompt, responseFormat, defaultTokenLimit } = buildPrompt({
      action,
      prompt,
      context,
      keyword: targetKeyword,
      carModel: targetCar,
      carSlug,
      location: targetLocation,
      availableCars,
      existingArticles,
      maxTokens,
      locProfile,
      segmentProfile,
      calculatedPricing,
    });

    // 5. Gọi OpenAI với cơ chế Fallback & Timeout
    let callResult;
    try {
      callResult = await callOpenAiWithResilience(apiKey, model, systemPrompt, userPrompt, {
        responseFormat,
        maxTokens,
        defaultTokenLimit,
      });
    } catch (err: unknown) {
      if (err instanceof OpenAiClientError) {
        throw new AiServiceError(err.message, err.code, err.statusCode);
      }
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi gọi OpenAI';
      throw new AiServiceError(msg, 'OPENAI_UNKNOWN_ERROR', 500);
    }

    // 6. Chuyển đổi và chuẩn hóa cấu trúc dữ liệu phản hồi
    const transformCtx: TransformContext = {
      action,
      prompt,
      targetCar,
      targetLocation,
      targetKeyword,
      availableCars,
      locProfile,
      calculatedPricing,
    };

    try {
      const transformed = transformAiResponse(callResult.content, callResult.model, transformCtx, Boolean(responseFormat));
      transformed.usage = callResult.usage;
      return transformed;
    } catch (transformErr: unknown) {
      const msg = transformErr instanceof Error ? transformErr.message : 'Lỗi chuẩn hóa dữ liệu AI';
      throw new AiServiceError(msg, 'TRANSFORM_ERROR', 500);
    }
  }
}

export const aiService = new AiService();
