import type {
  AiAction,
  AiCarSummary,
  FullArticleBlock,
  FullArticleResult,
  OutlineItem,
  FaqItem,
  SeoOptimizationResult,
  CarFullContentResult,
} from '@cardealer/types';

export interface LocationProfile {
  name: string;
  plateCode: string;
  registrationFeePercent: number; // Tỷ lệ lệ phí trước bạ (10%)
  plateFee: number; // Lệ phí cấp biển số xe con (VNĐ)
  areas: string[];
  facts: string[];
}

export interface SegmentProfile {
  label: string;
  buyers: string;
  priorities: string;
  avoid: string;
  angles: string[];
}

export interface CarVersionInput {
  tenPhienBan: string;
  giaNiemYet: number;
  giaKhuyenMai?: number | null;
}

export interface CalculatedVersionPrice {
  version: string;
  listedPrice: number;
  discount: number;
  rollingPrice: number;
  note: string;
}

export interface PricingCalculation {
  registrationPercent: number;
  plateFee: number;
  traTruocTu: number;
  versionPrices: CalculatedVersionPrice[];
}

export interface ExistingCarArticleSummary {
  carName: string;
  carSlug: string;
  segment?: string;
  title: string;
  focusKeyword?: string;
  summary?: string;
  sourceType?: 'car_article' | 'post';
}

export interface PromptBuilderInput {
  action: AiAction;
  prompt: string;
  context?: string;
  keyword?: string;
  carModel?: string;
  carSlug?: string;
  location?: string;
  availableCars?: AiCarSummary[];
  existingArticles?: ExistingCarArticleSummary[];
  maxTokens?: number;
  locProfile: LocationProfile;
  segmentProfile: SegmentProfile;
  calculatedPricing: PricingCalculation;
}

export interface PromptBuilderResult {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: { type: 'json_object' };
  defaultTokenLimit: number;
}

export interface OpenAiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface OpenAiCallOptions {
  responseFormat?: { type: 'json_object' };
  maxTokens?: number;
  defaultTokenLimit?: number;
  timeoutMs?: number;
}

export interface OpenAiCallResult {
  content: string;
  model: string;
  usage?: OpenAiUsage;
}

export interface TransformContext {
  action: AiAction;
  prompt: string;
  targetCar: string;
  targetLocation: string;
  targetKeyword: string;
  availableCars?: AiCarSummary[];
  locProfile: LocationProfile;
  calculatedPricing: PricingCalculation;
}
