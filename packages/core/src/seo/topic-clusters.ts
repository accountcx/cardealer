import type { TopicClusterItem, TopicClusterType } from '@cardealer/types';

export interface TopicClusterDefinition {
  key: TopicClusterItem;
  label: string;
  shortLabel: string;
  description: string;
  funnel: 'MOFU' | 'BOFU' | 'TOFU' | 'Loyalty';
  targetPillarUrl: string;
  badgeClass: string;
  keywords: string[];
}

export const TOPIC_CLUSTERS: Record<TopicClusterItem, TopicClusterDefinition> = {
  comparison: {
    key: 'comparison',
    label: 'Cụm 1: So sánh xe (MOFU)',
    shortLabel: 'So sánh xe',
    description: 'So sánh Tucson vs CX-5, Accent vs Vios, Creta vs Seltos, Santa Fe vs Everest... thúc đẩy cân nhắc và chốt lead',
    funnel: 'MOFU',
    targetPillarUrl: '/xe',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    keywords: ['so sánh', 'đối đầu', 'vs', 'so với', 'cạnh tranh', 'đối thủ', 'chọn xe nào', 'chọn mua', 'hơn gì'],
  },
  finance_procedure: {
    key: 'finance_procedure',
    label: 'Cụm 2: Thủ tục & Tài chính (BOFU)',
    shortLabel: 'Thủ tục & Tài chính',
    description: 'Thủ tục mua xe trả góp A-Z, quy trình đăng ký bấm biển số xe tại Nghệ An & Hà Tĩnh, dự toán lăn bánh trọn gói',
    funnel: 'BOFU',
    targetPillarUrl: '/gia-lan-banh',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    keywords: [
      'trả góp',
      'thủ tục',
      'lãi suất',
      'ngân hàng',
      'lăn bánh',
      'đăng ký',
      'bấm biển',
      'biển số',
      'trước bạ',
      'thuế trước bạ',
      'chi phí ra biển',
      'hồ sơ vay',
      'vay mua xe',
    ],
  },
  detailed_review: {
    key: 'detailed_review',
    label: 'Cụm 3: Đánh giá chi tiết & Nuôi xe (E-E-A-T)',
    shortLabel: 'Đánh giá chi tiết',
    description: 'Mức tiêu hao nhiên liệu thực tế, chi phí bảo dưỡng từng cấp độ km, đánh giá hệ thống an toàn SmartSense',
    funnel: 'Loyalty',
    targetPillarUrl: '/xe',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    keywords: [
      'đánh giá',
      'tiêu hao nhiên liệu',
      'xăng',
      'bảo dưỡng',
      'chi phí nuôi',
      'nuôi xe',
      'smartsense',
      'vận hành',
      'ưu nhược điểm',
      'kinh nghiệm lái',
      'cảm nhận',
      'mẹo',
      'chăm sóc',
    ],
  },
};

export const TOPIC_CLUSTER_LIST = Object.values(TOPIC_CLUSTERS);

export function getTopicClusterDetails(cluster?: string | null): TopicClusterDefinition | null {
  if (!cluster) return null;
  const key = cluster as TopicClusterItem;
  return TOPIC_CLUSTERS[key] || null;
}

export function detectTopicCluster(
  title: string,
  angle?: string | null,
  keyword?: string | null
): TopicClusterItem {
  const combined = `${title || ''} ${angle || ''} ${keyword || ''}`.toLowerCase();

  // 1. So sánh xe có độ ưu tiên cao nhất nếu có từ khóa so sánh
  if (TOPIC_CLUSTERS.comparison.keywords.some((kw) => combined.includes(kw))) {
    return 'comparison';
  }

  // 2. Thủ tục & Tài chính
  if (TOPIC_CLUSTERS.finance_procedure.keywords.some((kw) => combined.includes(kw))) {
    return 'finance_procedure';
  }

  // 3. Mặc định hoặc Đánh giá chi tiết
  return 'detailed_review';
}

export function formatClusterAngle(cluster: TopicClusterItem, rawAngle?: string | null): string {
  const label = TOPIC_CLUSTERS[cluster]?.shortLabel || 'Chuyên đề';
  const prefix = `[${label}]`;
  const cleanAngle = (rawAngle || '').replace(/^\[[^\]]+\]\s*/, '').trim();
  return cleanAngle ? `${prefix} ${cleanAngle}` : prefix;
}

export function parseClusterFromAngle(angle?: string | null): {
  cluster: TopicClusterItem | null;
  cleanAngle: string;
} {
  if (!angle) {
    return { cluster: null, cleanAngle: '' };
  }

  const match = angle.match(/^\[(.*?)\]\s*(.*)$/);
  if (!match) {
    return { cluster: null, cleanAngle: angle.trim() };
  }

  const tag = match[1].trim().toLowerCase();
  const cleanAngle = match[2].trim();

  if (tag.includes('so sánh')) {
    return { cluster: 'comparison', cleanAngle };
  }
  if (tag.includes('thủ tục') || tag.includes('tài chính') || tag.includes('trả góp')) {
    return { cluster: 'finance_procedure', cleanAngle };
  }
  if (tag.includes('đánh giá') || tag.includes('chi tiết') || tag.includes('nuôi xe')) {
    return { cluster: 'detailed_review', cleanAngle };
  }

  return { cluster: null, cleanAngle };
}
