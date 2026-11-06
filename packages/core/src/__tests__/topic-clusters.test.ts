import { describe, it, expect } from 'vitest';
import {
  TOPIC_CLUSTERS,
  TOPIC_CLUSTER_LIST,
  detectTopicCluster,
  formatClusterAngle,
  parseClusterFromAngle,
  getTopicClusterDetails,
} from '../seo/topic-clusters';
import {
  TopicClusterTypeSchema,
  TopicClusterItemSchema,
  EditorialPlanItemSchema,
  GenerateEditorialPlanRequestSchema,
  CreateContentPlanItemInputSchema,
} from '@cardealer/types';

describe('Topic Cluster Strategy for Blog & Editorial Planner (US-07 & SEO Engine)', () => {
  describe('TC-C01: Cluster Definitions & Metadata', () => {
    it('định nghĩa đầy đủ 3 cụm chủ đề cốt lõi', () => {
      expect(TOPIC_CLUSTER_LIST).toHaveLength(3);
      expect(TOPIC_CLUSTERS.comparison).toBeDefined();
      expect(TOPIC_CLUSTERS.finance_procedure).toBeDefined();
      expect(TOPIC_CLUSTERS.detailed_review).toBeDefined();

      expect(TOPIC_CLUSTERS.comparison.funnel).toBe('MOFU');
      expect(TOPIC_CLUSTERS.finance_procedure.funnel).toBe('BOFU');
      expect(TOPIC_CLUSTERS.detailed_review.targetPillarUrl).toBe('/xe');
    });

    it('tra cứu chi tiết cụm chủ đề hợp lệ và không hợp lệ', () => {
      const comparisonInfo = getTopicClusterDetails('comparison');
      expect(comparisonInfo?.shortLabel).toBe('So sánh xe');

      const invalidInfo = getTopicClusterDetails('invalid_cluster');
      expect(invalidInfo).toBeNull();
    });
  });

  describe('TC-C02: Topic Cluster Detection Engine', () => {
    it('nhận diện chính xác Cụm 1: So sánh xe (MOFU)', () => {
      expect(detectTopicCluster('So sánh Tucson và CX-5: Đâu là lựa chọn tối ưu?')).toBe('comparison');
      expect(detectTopicCluster('So sánh Accent và Vios', 'Góc nhìn người mua xe lần đầu')).toBe('comparison');
      expect(detectTopicCluster('So sánh Santa Fe và Everest 2026')).toBe('comparison');
      expect(detectTopicCluster('Creta vs Seltos: Đánh giá chi tiết 2 mẫu B-SUV')).toBe('comparison');
    });

    it('nhận diện chính xác Cụm 2: Thủ tục & Tài chính (BOFU)', () => {
      expect(detectTopicCluster('Hướng dẫn thủ tục mua xe trả góp từ A-Z tại Nghệ An')).toBe('finance_procedure');
      expect(detectTopicCluster('Quy trình đăng ký biển số xe tại Nghệ An & Hà Tĩnh')).toBe('finance_procedure');
      expect(detectTopicCluster('Dự toán chi phí lăn bánh Hyundai Tucson mới nhất')).toBe('finance_procedure');
      expect(detectTopicCluster('Bảng tính lãi suất vay ngân hàng mua ô tô 2026')).toBe('finance_procedure');
    });

    it('nhận diện chính xác Cụm 3: Đánh giá chi tiết & Nuôi xe (E-E-A-T)', () => {
      expect(detectTopicCluster('Đánh giá thực tế mức tiêu hao nhiên liệu Hyundai Creta')).toBe('detailed_review');
      expect(detectTopicCluster('Bảng chi phí bảo dưỡng từng cấp độ cho xe Hyundai')).toBe('detailed_review');
      expect(detectTopicCluster('Trải nghiệm gói an toàn Hyundai SmartSense trên cao tốc Diễn Châu - Bãi Vọt')).toBe(
        'detailed_review'
      );
      expect(detectTopicCluster('Mẹo lái xe ô tô tiết kiệm xăng trong mùa hè miền Trung')).toBe('detailed_review');
    });
  });

  describe('TC-C03: Format & Parse Cluster in Angle Metadata', () => {
    it('đóng gói và trích xuất tag Cụm chủ đề vào chuỗi angle', () => {
      const formatted = formatClusterAngle('comparison', 'So sánh Tucson vs CX-5');
      expect(formatted).toBe('[So sánh xe] So sánh Tucson vs CX-5');

      const parsed = parseClusterFromAngle(formatted);
      expect(parsed.cluster).toBe('comparison');
      expect(parsed.cleanAngle).toBe('So sánh Tucson vs CX-5');
    });

    it('xử lý an toàn khi angle chưa có tag cụm', () => {
      const parsed = parseClusterFromAngle('Góc nhìn trải nghiệm thực tế');
      expect(parsed.cluster).toBeNull();
      expect(parsed.cleanAngle).toBe('Góc nhìn trải nghiệm thực tế');
    });

    it('không bị lặp lại prefix khi formatClusterAngle được gọi nhiều lần', () => {
      const first = formatClusterAngle('finance_procedure', 'Thủ tục trả góp');
      const second = formatClusterAngle('finance_procedure', first);
      expect(second).toBe('[Thủ tục & Tài chính] Thủ tục trả góp');
    });
  });

  describe('TC-C04: Zod Schemas & Type Safety', () => {
    it('validate thành công TopicClusterTypeSchema và TopicClusterItemSchema', () => {
      expect(TopicClusterTypeSchema.parse('all')).toBe('all');
      expect(TopicClusterTypeSchema.parse('comparison')).toBe('comparison');
      expect(TopicClusterTypeSchema.parse('finance_procedure')).toBe('finance_procedure');
      expect(TopicClusterTypeSchema.parse('detailed_review')).toBe('detailed_review');

      expect(() => TopicClusterTypeSchema.parse('invalid')).toThrow();
      expect(() => TopicClusterItemSchema.parse('all')).toThrow();
    });

    it('EditorialPlanItemSchema chấp nhận thuộc tính cluster hợp lệ', () => {
      const item = {
        title: 'So Sánh Hyundai Tucson Và Mazda CX-5 2026',
        focusKeyword: 'so sánh tucson và cx5',
        angle: 'So sánh trang bị và giá lăn bánh',
        summary: 'Phân tích chi tiết ưu nhược điểm của 2 mẫu crossover cỡ C hàng đầu.',
        cluster: 'comparison' as const,
        suggestedDay: 5,
      };

      const parsed = EditorialPlanItemSchema.parse(item);
      expect(parsed.cluster).toBe('comparison');
    });

    it('GenerateEditorialPlanRequestSchema mặc định clusterStrategy là all', () => {
      const req = {};
      const parsed = GenerateEditorialPlanRequestSchema.parse(req);
      expect(parsed.clusterStrategy).toBe('all');

      const customReq = { clusterStrategy: 'comparison' as const };
      const parsedCustom = GenerateEditorialPlanRequestSchema.parse(customReq);
      expect(parsedCustom.clusterStrategy).toBe('comparison');
    });

    it('CreateContentPlanItemInputSchema chấp nhận thuộc tính cluster', () => {
      const itemInput = {
        title: 'Quy trình đăng ký bấm biển số tại Nghệ An',
        focusKeyword: 'đăng ký biển số xe nghệ an',
        scheduledAt: new Date('2026-11-15T08:00:00Z'),
        cluster: 'finance_procedure' as const,
      };

      const parsed = CreateContentPlanItemInputSchema.parse(itemInput);
      expect(parsed.cluster).toBe('finance_procedure');
    });
  });
});
