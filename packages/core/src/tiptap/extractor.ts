// 🧠 Mental Model: Bộ trích xuất Server-Side Tiptap JSON AST độc quyền tại @cardealer/core
// Trích xuất Headings cho TOC Scrollspy, FAQs cho FAQPage Schema, Videos cho VideoObject Schema,
// và nhận diện Gated Content để tự động kích hoạt Paywall Schema chống phạt Google Cloaking.

export interface TiptapNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

export interface TiptapDoc {
  type?: string;
  content?: TiptapNode[];
}

export interface TocHeading {
  id: string;
  title: string;
  level: number;
}

export interface ExtractedFaq {
  question: string;
  answer: string;
}

export interface ExtractedVideo {
  type: 'youtube' | 'tiktok';
  videoId: string;
  url: string;
  title?: string;
  posterUrl?: string;
  duration?: string; // ISO 8601 duration (e.g. PT3M15S) theo Google VideoObject guidelines
  uploadDate?: string;
}

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug URL thân thiện làm anchor id (#slug)
 */
export function slugifyVietnamese(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Đệ quy trích xuất toàn bộ văn bản thuần từ một Tiptap Node
 */
export function extractTextFromNode(node: TiptapNode | undefined | null): string {
  if (!node) return '';
  if (node.text) return node.text;
  if (!Array.isArray(node.content)) return '';
  return node.content.map(extractTextFromNode).join(' ').trim();
}

/**
 * Trích xuất toàn bộ văn bản thuần của bài viết phục vụ đếm từ và chấm điểm SEO
 */
export function extractTextFromTiptap(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return '';
  return root.content.map(extractTextFromNode).join('\n').trim();
}

/**
 * 1. Trích xuất danh sách Headings (H2, H3, H4) phục vụ render Sticky TOC
 */
export function extractHeadingsFromTiptap(doc: unknown): TocHeading[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const headings: TocHeading[] = [];
  const seenIds = new Set<string>();

  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'heading') {
        const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
        // Chỉ lấy các thẻ tiêu đề H2, H3, H4 cho bảng mục lục
        if (level >= 2 && level <= 4) {
          const title = extractTextFromNode(node);
          if (title) {
            let baseId = slugifyVietnamese(title) || `heading-${headings.length + 1}`;
            let uniqueId = baseId;
            let counter = 1;
            while (seenIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}`;
              counter++;
            }
            seenIds.add(uniqueId);
            headings.push({ id: uniqueId, title, level });
          }
        }
      }
      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return headings;
}

/**
 * 2. Trích xuất các khối FAQBlock phục vụ tự động sinh Schema JSON-LD `FAQPage`
 */
export function extractFaqsFromTiptap(doc: unknown): ExtractedFaq[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const faqs: ExtractedFaq[] = [];

  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'faqBlock' && node.attrs?.questions) {
        const questions = node.attrs.questions;
        if (Array.isArray(questions)) {
          for (const item of questions) {
            if (item && typeof item === 'object' && 'question' in item && 'answer' in item) {
              const q = String(item.question || '').trim();
              const a = String(item.answer || '').trim();
              if (q && a) {
                faqs.push({ question: q, answer: a });
              }
            }
          }
        }
      }
      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return faqs;
}

/**
 * 3. Trích xuất danh sách Video (YouTube & TikTok) phục vụ sinh Schema `VideoObject`
 */
export function extractVideosFromTiptap(doc: unknown): ExtractedVideo[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const videos: ExtractedVideo[] = [];

  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'youtubeBlock' && node.attrs?.videoId) {
        videos.push({
          type: 'youtube',
          videoId: String(node.attrs.videoId),
          url: String(node.attrs.videoUrl || `https://www.youtube.com/watch?v=${node.attrs.videoId}`),
          title: node.attrs.caption ? String(node.attrs.caption) : undefined,
          duration: node.attrs.duration ? String(node.attrs.duration) : undefined,
          uploadDate: node.attrs.uploadDate ? String(node.attrs.uploadDate) : undefined,
        });
      } else if (node.type === 'tikTokBlock' && node.attrs?.videoId) {
        videos.push({
          type: 'tiktok',
          videoId: String(node.attrs.videoId),
          url: String(node.attrs.videoUrl || `https://www.tiktok.com/@hyundai/video/${node.attrs.videoId}`),
          title: node.attrs.title ? String(node.attrs.title) : undefined,
          posterUrl: node.attrs.posterImageUrl ? String(node.attrs.posterImageUrl) : undefined,
          duration: node.attrs.duration ? String(node.attrs.duration) : undefined,
          uploadDate: node.attrs.uploadDate ? String(node.attrs.uploadDate) : undefined,
        });
      }
      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return videos;
}

/**
 * 4. Phát hiện sự tồn tại của khối Gated Content để kích hoạt Paywall Schema chống phạt Google Cloaking
 */
export function hasGatedContent(doc: unknown): boolean {
  if (!doc || typeof doc !== 'object') return false;
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return false;

  let found = false;
  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'gatedContent') {
        found = true;
        return;
      }
      if (Array.isArray(node.content) && !found) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return found;
}

/**
 * 5. Tính toán tổng số từ và thời gian đọc ước tính (trung bình 200 từ/phút)
 */
export function calculateReadingTimeAndWordCount(doc: unknown): { readingTime: number; wordCount: number } {
  const fullText = extractTextFromTiptap(doc);
  if (!fullText) {
    return { readingTime: 1, wordCount: 0 };
  }

  // Tách từ theo khoảng trắng, dấu ngắt dòng
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  // Chuẩn đọc trung bình của người Việt: 200 - 250 từ/phút
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { readingTime, wordCount };
}
