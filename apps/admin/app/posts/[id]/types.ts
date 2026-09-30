// 🧠 Mental Model: Kiểu dữ liệu & Contracts chuẩn hóa cho Studio Soạn Thảo Bài Viết (@cardealer/admin).
// Tương thích 100% với Server-Side Tiptap JSON AST Tree và E-E-A-T Content Blocks.

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'callout'
  | 'youtube'
  | 'tiktok'
  | 'faq'
  | 'relatedCar'
  | 'priceTable'
  | 'leadForm'
  | 'singleImage'
  | 'imageGallery'
  | 'specTable'
  | 'ctaButton'
  | 'prosCons';

export interface PriceVersionItem {
  version: string;
  listedPrice: number;
  discount: number;
  rollingPrice: number;
}

export interface EditorBlock {
  id: string;
  type: BlockType;
  level?: number; // Cho heading (2, 3)
  content?: string; // Cho paragraph, heading, callout
  title?: string;
  calloutType?: 'info' | 'warning' | 'success' | 'note';
  videoId?: string;
  videoUrl?: string;
  caption?: string;
  posterUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;

  carName?: string;
  carSlug?: string;
  carPrice?: number;
  carImage?: string;
  seatCount?: number;
  fuelType?: string;
  prices?: PriceVersionItem[];
  carFilter?: string; // Bộ lọc dòng xe cho PriceTable Block
  formHeadline?: string;
  formSubheadline?: string;
  formButtonText?: string;
  // Khối ảnh đơn có Alt Text & Chú thích
  imageUrl?: string;
  imageAlt?: string;
  // Thư viện ảnh lướt / Carousel
  galleryStyle?: 'slider' | 'grid';
  galleryImages?: Array<{ url: string; alt?: string; caption?: string }>;
  // Bảng so sánh thông số kỹ thuật
  specVersions?: string[];
  specRows?: Array<{ specName: string; values: string[] }>;
  // Nút bấm CTA
  ctaButtonText?: string;
  ctaActionType?: 'hotline' | 'zalo' | 'quoteForm' | 'customLink';
  ctaCustomUrl?: string;
  ctaPhone?: string;
  ctaSubtext?: string;
  ctaVariant?: 'red' | 'blue' | 'emerald';
  // Khối Ưu / Nhược điểm
  pros?: string[];
  cons?: string[];
}

export type MediaPickerTarget =
  | { type: 'featured' }
  | { type: 'singleImage'; blockId: string }
  | { type: 'gallery'; blockId: string }
  | null;

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface CalloutThemeConfig {
  label: string;
  badge: string;
  icon: string;
  cardClass: string;
  headerTextClass: string;
  selectBorderClass: string;
  placeholderTitle: string;
  placeholderContent: string;
  previewCue: string;
}
