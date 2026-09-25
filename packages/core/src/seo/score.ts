// 🧠 Mental Model: Động cơ chấm điểm SEO Real-Time 10 Tiêu Chí Chuẩn SEO Onpage (@cardealer/core)
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// Nâng cấp toàn diện theo chuẩn Senior Technical SEO & Software Architect:
// 1. Khớp từ khóa chuẩn xác với Word Boundary Regex (tránh Substring Collision giữa 'i10' và 'chi 100tr').
// 2. Phân tách công thức Mật độ từ khóa: Word-share Density cho từ khóa ngắn và Phrase Occurrence Density cho Long-tail (>= 3 từ).
// 3. Kiểm soát phân cấp Heading Hierarchy: Phát hiện và cảnh báo nếu có thẻ H1 phụ xuất hiện trong editor body.
// 4. Đoạn mở đầu chuẩn xác từ Paragraph đầu tiên của bài viết (loại trừ caption ảnh, callout, quote).
// 5. Thẩm định liên kết nội bộ an toàn bằng URL parser (tránh nhầm link mạng xã hội facebook.com/hyundaivinh).
// 6. Tối ưu vị trí từ khóa ở nửa đầu tiêu đề (CTR Maximizer) và kiểm soát độ dài slug (< 75 ký tự).
// 7. Cannibalization Guard nâng cao với Token Jaccard Similarity chống trùng lặp biến thể.

import {
  extractTextFromTiptap,
  extractTextFromNode,
  extractHeadingsFromTiptap,
  slugifyVietnamese,
  calculateReadingTimeAndWordCount,
  type TiptapDoc,
  type TiptapNode,
} from '../tiptap/extractor';

export interface SeoPostSummary {
  id?: string;
  slug?: string;
  focusKeyword?: string | null;
  tieuDe?: string;
}

export interface SeoAnalysisInput {
  tieuDe?: string;
  slug?: string;
  focusKeyword?: string;
  noiDung?: unknown; // Tiptap JSON Tree
  metaDescription?: string;
  existingPosts?: SeoPostSummary[];
  currentPostId?: string;
}

export interface SeoCriterionResult {
  id: string;
  label: string;
  passed: boolean;
  score: number;
  maxScore: number;
  current?: string | number;
  message?: string;
}

export interface SeoAnalysisResult {
  success: boolean;
  score: number;
  maxScore: number;
  status: 'good' | 'needs_improvement' | 'poor';
  criteria: SeoCriterionResult[];
  summary: {
    wordCount: number;
    readingTime: number;
    headingCount: number;
    h1InBodyCount: number;
    h2Count: number;
    imageCount: number;
    imageWithAltCount: number;
    internalLinkCount: number;
    keywordDensity: number;
    keywordOccurrences: number;
    isLongTail: boolean;
  };
}

/**
 * Danh sách tên thương mại của các dòng xe đang phân phối (phục vụ Cannibalization Guard R-08)
 */
export const COMMERCIAL_CAR_MODELS = [
  'grand i10',
  'i10',
  'accent',
  'elantra',
  'creta',
  'tucson',
  'santa fe',
  'santafe',
  'custin',
  'palisade',
  'venue',
  'ioniq 5',
  'ioniq5',
  'stargazer',
  'stargazer x',
  'hyundai grand i10',
  'hyundai accent',
  'hyundai elantra',
  'hyundai creta',
  'hyundai tucson',
  'hyundai santa fe',
  'hyundai custin',
  'hyundai palisade',
  'hyundai venue',
  'hyundai ioniq 5',
  'hyundai stargazer',
];

/**
 * Địa danh địa phương ưu tiên cho SEO khu vực Nghệ An & Hà Tĩnh
 */
export const LOCAL_SEO_KEYWORDS = [
  'vinh',
  'nghệ an',
  'nghe an',
  'hà tĩnh',
  'ha tinh',
  'diễn châu',
  'quỳnh lưu',
  'hoàng mai',
  'thái hòa',
  'cửa lò',
  'nam đàn',
  'hồng lĩnh',
  'kỳ anh',
];

/**
 * Chuẩn hóa chuỗi văn bản phục vụ so sánh (chữ thường, bỏ dấu tiếng Việt, loại bỏ khoảng trắng thừa)
 */
export function normalizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[\s\-_]+/g, ' ')
    .trim();
}

/**
 * 🎯 Đếm số lần xuất hiện của từ khóa với Word Boundary Regex (Lookbehind)
 * Giải quyết triệt để lỗi Substring Collision giữa 'i10' và 'chi 100tr'
 */
export function countKeywordOccurrences(fullText: string, keyword: string): number {
  const normText = normalizeText(fullText);
  const normKeyword = normalizeText(keyword);
  if (!normText || !normKeyword) return 0;

  const escapedKw = normKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Word boundary regex: sử dụng lookbehind (?<=^|\\s) để không tiêu thụ khoảng trắng dẫn
  const regex = new RegExp(`(?<=^|\\s)${escapedKw}(?=[\\s.,!?:;]|$)`, 'gi');
  const matches = normText.match(regex);
  return matches ? matches.length : 0;
}

/**
 * 🎯 Trích xuất nội dung văn bản của đoạn Paragraph đầu tiên (loại trừ callout, quote, caption ảnh)
 */
export function extractFirstParagraphText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return '';

  for (const node of root.content) {
    if (node.type === 'paragraph') {
      const text = extractTextFromNode(node);
      if (text.trim().length > 0) {
        return text.trim();
      }
    }
  }
  return '';
}

/**
 * 🎯 Đếm số thẻ H1 xuất hiện bên trong nội dung soạn thảo
 */
export function countH1InBody(doc: unknown): number {
  if (!doc || typeof doc !== 'object') return 0;
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return 0;

  let h1Count = 0;
  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'heading' && node.attrs?.level === 1) {
        h1Count++;
      }
      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };
  traverse(root.content);
  return h1Count;
}

/**
 * Trích xuất toàn bộ ảnh và thẻ Alt từ tài liệu Tiptap
 */
export function extractImagesFromTiptap(doc: unknown): Array<{ src?: string; alt?: string }> {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const images: Array<{ src?: string; alt?: string }> = [];

  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      if (node.type === 'image' && node.attrs) {
        images.push({
          src: typeof node.attrs.src === 'string' ? node.attrs.src : undefined,
          alt: typeof node.attrs.alt === 'string' ? node.attrs.alt : undefined,
        });
      } else if (node.type === 'galleryBlock' && node.attrs?.images && Array.isArray(node.attrs.images)) {
        for (const img of node.attrs.images) {
          if (img && typeof img === 'object') {
            images.push({
              src: typeof img.src === 'string' ? img.src : undefined,
              alt: typeof img.alt === 'string' ? img.alt : undefined,
            });
          }
        }
      }
      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return images;
}

/**
 * Trích xuất danh sách liên kết nội bộ từ tài liệu Tiptap
 */
export function extractInternalLinksFromTiptap(doc: unknown): string[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const internalLinks: string[] = [];

  const traverse = (nodes: TiptapNode[]) => {
    for (const node of nodes) {
      // 1. Kiểm tra marks link
      if (Array.isArray(node.marks)) {
        for (const mark of node.marks) {
          if (mark.type === 'link' && mark.attrs?.href) {
            const href = String(mark.attrs.href).trim();
            if (isInternalLink(href)) {
              internalLinks.push(href);
            }
          }
        }
      }

      // 2. Khối RelatedCarBlock hoặc PriceTableBlock cũng được tính là liên kết nội bộ
      if (node.type === 'relatedCarBlock' && node.attrs?.carSlug) {
        internalLinks.push(`/xe/${node.attrs.carSlug}`);
      } else if (node.type === 'priceTableBlock' && node.attrs?.carSlug) {
        internalLinks.push(`/xe/${node.attrs.carSlug}#bang-gia`);
      }

      if (Array.isArray(node.content)) {
        traverse(node.content);
      }
    }
  };

  traverse(root.content);
  return internalLinks;
}

/**
 * 🎯 Kiểm tra xem một URL có phải là liên kết nội bộ hay không bằng URL Parser
 * Tránh false-positive với các URL mạng xã hội như facebook.com/xehyundaivinh hay youtube.com/watch?v=...hyundaivinh
 */
export function isInternalLink(href: string, baseDomain = 'xehyundaivinh.com'): boolean {
  if (!href) return false;
  const cleanHref = href.trim();
  if (cleanHref.startsWith('/') || cleanHref.startsWith('#')) return true;
  try {
    const url = new URL(cleanHref, `https://${baseDomain}`);
    return (
      url.hostname === baseDomain ||
      url.hostname.endsWith(`.${baseDomain}`) ||
      url.hostname === 'cardealer.local' ||
      url.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

/**
 * 🎯 Tính toán độ tương đồng từ khóa theo Jaccard Similarity Token
 */
export function calculateTokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeText(a).split(' ').filter(Boolean));
  const tokensB = new Set(normalizeText(b).split(' ').filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * 🎯 Hàm tính điểm SEO 10 Tiêu Chí Real-Time (Production-Grade)
 */
export function calculateSeoScore(input: SeoAnalysisInput): SeoAnalysisResult {
  const {
    tieuDe = '',
    slug = '',
    focusKeyword = '',
    noiDung,
    metaDescription = '',
    existingPosts = [],
    currentPostId,
  } = input;

  const criteria: SeoCriterionResult[] = [];

  // Trích xuất dữ liệu cơ sở từ Tiptap AST
  const fullText = extractTextFromTiptap(noiDung);
  const firstParagraph = extractFirstParagraphText(noiDung);
  const { readingTime, wordCount } = calculateReadingTimeAndWordCount(noiDung);
  const headings = extractHeadingsFromTiptap(noiDung);
  const h1InBodyCount = countH1InBody(noiDung);
  const h2Headings = headings.filter((h) => h.level === 2);
  const images = extractImagesFromTiptap(noiDung);
  const internalLinks = extractInternalLinksFromTiptap(noiDung);

  const trimmedKeyword = focusKeyword.trim();
  const normKeyword = normalizeText(trimmedKeyword);
  const keywordSlug = slugifyVietnamese(trimmedKeyword);
  const kwWords = trimmedKeyword ? trimmedKeyword.split(/\s+/).filter(Boolean).length : 1;
  const isLongTail = kwWords >= 3;

  // Tính toán tần suất xuất hiện với Word Boundary Regex
  const keywordOccurrences = trimmedKeyword ? countKeywordOccurrences(fullText, trimmedKeyword) : 0;

  // 🎯 Công thức mật độ thông minh:
  // - Từ khóa ngắn (< 3 từ): Word-share Density (keywordOccurrences * kwWords / wordCount) * 100
  // - Từ khóa dài (>= 3 từ): Phrase Occurrence Density (keywordOccurrences / wordCount) * 100
  const rawDensity =
    wordCount > 0
      ? isLongTail
        ? (keywordOccurrences / wordCount) * 100
        : ((keywordOccurrences * kwWords) / wordCount) * 100
      : 0;
  const keywordDensity = Math.round(rawDensity * 10) / 10;

  // =========================================================================
  // 1. Tiêu chí 1: Độ dài tiêu đề & Vị trí từ khóa (40 - 65 ký tự) - Tối đa 10 điểm
  // =========================================================================
  const titleLength = tieuDe.trim().length;
  const normTitle = normalizeText(tieuDe);
  const kwIndexInTitle = normKeyword ? normTitle.indexOf(normKeyword) : -1;
  const hasExactKwInTitle = kwIndexInTitle !== -1;
  const kwTokens = normKeyword.split(' ').filter(Boolean);
  const hasAllTokensInTitle = kwTokens.length > 0 && kwTokens.every((t) => normTitle.includes(t));
  const isKwInFirstHalf = hasExactKwInTitle && kwIndexInTitle <= Math.floor(normTitle.length / 2);

  if (titleLength >= 40 && titleLength <= 65) {
    if (hasExactKwInTitle && isKwInFirstHalf) {
      criteria.push({
        id: 'title_length',
        label: 'Độ dài tiêu đề (40-65 ký tự)',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${titleLength} ký tự`,
        message: 'Độ dài tiêu đề tối ưu và từ khóa nằm ở nửa đầu tiêu đề (tăng tối đa tỷ lệ click CTR)',
      });
    } else if (hasExactKwInTitle) {
      criteria.push({
        id: 'title_length',
        label: 'Độ dài tiêu đề (40-65 ký tự)',
        passed: true,
        score: 9,
        maxScore: 10,
        current: `${titleLength} ký tự`,
        message: 'Độ dài tiêu đề đạt chuẩn, nên chuyển từ khóa chính lên nửa đầu tiêu đề để tối ưu CTR',
      });
    } else if (hasAllTokensInTitle) {
      criteria.push({
        id: 'title_length',
        label: 'Độ dài tiêu đề (40-65 ký tự)',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${titleLength} ký tự`,
        message: 'Độ dài tiêu đề đạt chuẩn và chứa đầy đủ các từ của từ khóa chính',
      });
    } else {
      criteria.push({
        id: 'title_length',
        label: 'Độ dài tiêu đề (40-65 ký tự)',
        passed: true,
        score: 8,
        maxScore: 10,
        current: `${titleLength} ký tự`,
        message: 'Độ dài tiêu đề đạt chuẩn SEO (40-65 ký tự) nhưng chưa chứa từ khóa chính',
      });
    }
  } else if ((titleLength >= 30 && titleLength < 40) || (titleLength > 65 && titleLength <= 75)) {
    criteria.push({
      id: 'title_length',
      label: 'Độ dài tiêu đề (40-65 ký tự)',
      passed: false,
      score: 6,
      maxScore: 10,
      current: `${titleLength} ký tự`,
      message:
        titleLength < 40
          ? `Tiêu đề hơi ngắn (${titleLength}/40 ký tự), hãy bổ sung thêm địa danh hoặc năm phiên bản`
          : `Tiêu đề hơi dài (${titleLength}/65 ký tự), có thể bị Google cắt bớt trên Mobile`,
    });
  } else {
    criteria.push({
      id: 'title_length',
      label: 'Độ dài tiêu đề (40-65 ký tự)',
      passed: false,
      score: titleLength > 0 ? 2 : 0,
      maxScore: 10,
      current: `${titleLength} ký tự`,
      message:
        titleLength === 0
          ? 'Chưa nhập tiêu đề bài viết'
          : titleLength < 30
            ? 'Tiêu đề quá ngắn (< 30 ký tự), không đủ sức hút click CTR'
            : 'Tiêu đề quá dài (> 75 ký tự), chắc chắn bị cắt ngắn trên kết quả tìm kiếm',
    });
  }

  // =========================================================================
  // 2. Tiêu chí 2: Từ khóa trong URL Slug (Slug Keyword) - Tối đa 10 điểm
  // =========================================================================
  const cleanSlug = slugifyVietnamese(slug);
  if (!trimmedKeyword) {
    criteria.push({
      id: 'slug_keyword',
      label: 'Từ khóa trong URL Slug',
      passed: false,
      score: 0,
      maxScore: 10,
      current: cleanSlug || 'chưa có slug',
      message: 'Chưa thiết lập từ khóa chính',
    });
  } else if (cleanSlug.includes(keywordSlug)) {
    const isSlugTooLong = cleanSlug.length > 75;
    criteria.push({
      id: 'slug_keyword',
      label: 'Từ khóa trong URL Slug',
      passed: true,
      score: isSlugTooLong ? 8 : 10,
      maxScore: 10,
      current: cleanSlug,
      message: isSlugTooLong
        ? `URL Slug chứa từ khóa chính nhưng hơi dài (${cleanSlug.length}/75 ký tự), nên rút gọn các từ nối`
        : `URL Slug chứa trọn vẹn từ khóa '${keywordSlug}'`,
    });
  } else {
    // Kiểm tra tỷ lệ trùng lặp tokens giữa từ khóa và slug
    const kwTokensInSlug = keywordSlug.split('-').filter(Boolean);
    const matchedTokens = kwTokensInSlug.filter((token) => cleanSlug.includes(token));
    const tokenMatchRate = kwTokensInSlug.length > 0 ? matchedTokens.length / kwTokensInSlug.length : 0;

    if (tokenMatchRate >= 0.7) {
      criteria.push({
        id: 'slug_keyword',
        label: 'Từ khóa trong URL Slug',
        passed: true,
        score: 7,
        maxScore: 10,
        current: cleanSlug,
        message: 'Slug chứa hầu hết các từ của từ khóa chính',
      });
    } else {
      criteria.push({
        id: 'slug_keyword',
        label: 'Từ khóa trong URL Slug',
        passed: false,
        score: 0,
        maxScore: 10,
        current: cleanSlug,
        message: `URL Slug nên chứa từ khóa chính '${keywordSlug}'`,
      });
    }
  }

  // =========================================================================
  // 3. Tiêu chí 3: Từ khóa trong Đoạn mở đầu (100 từ đầu tiên) - Tối đa 10 điểm
  // 🎯 Lấy chính xác từ đoạn Paragraph đầu tiên, loại trừ caption/callout
  // =========================================================================
  const introSourceText = firstParagraph || fullText;
  const wordsList = introSourceText.split(/\s+/).filter(Boolean);
  const first100Words = wordsList.slice(0, 100).join(' ');
  const normIntro = normalizeText(first100Words);

  if (!trimmedKeyword) {
    criteria.push({
      id: 'intro_keyword',
      label: 'Từ khóa trong 100 từ đầu tiên',
      passed: false,
      score: 0,
      maxScore: 10,
      message: 'Chưa thiết lập từ khóa chính',
    });
  } else if (normIntro.includes(normKeyword)) {
    criteria.push({
      id: 'intro_keyword',
      label: 'Từ khóa trong 100 từ đầu tiên',
      passed: true,
      score: 10,
      maxScore: 10,
      message: 'Từ khóa chính xuất hiện ngay trong đoạn mở đầu bài viết',
    });
  } else {
    criteria.push({
      id: 'intro_keyword',
      label: 'Từ khóa trong 100 từ đầu tiên',
      passed: false,
      score: 0,
      maxScore: 10,
      message: 'Từ khóa chính chưa xuất hiện trong 100 từ đầu tiên của bài viết',
    });
  }

  // =========================================================================
  // 4. Tiêu chí 4: Mật độ từ khóa (Keyword Density) - Tối đa 10 điểm
  // 🎯 Tách biệt ngưỡng chuẩn giữa từ khóa ngắn (1.0% - 2.5%) và Long-tail (0.3% - 1.2%)
  // =========================================================================
  if (!trimmedKeyword || wordCount < 50) {
    criteria.push({
      id: 'keyword_density',
      label: isLongTail ? 'Mật độ cụm từ khóa (0.3% - 1.2%)' : 'Mật độ từ khóa (1.0% - 2.5%)',
      passed: false,
      score: 0,
      maxScore: 10,
      current: `${keywordDensity}%`,
      message: !trimmedKeyword
        ? 'Chưa thiết lập từ khóa chính'
        : 'Bài viết chưa đủ nội dung để đo mật độ từ khóa',
    });
  } else if (isLongTail) {
    // Ngưỡng cho từ khóa dài (>= 3 từ): Chuẩn vàng 0.3% - 1.2% (tương đương 2 - 7 lần cho bài 600 từ)
    if (rawDensity >= 0.3 && rawDensity <= 1.2) {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ cụm từ khóa dài (0.3% - 1.2%)',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message: 'Mật độ cụm từ khóa dài đạt chuẩn vàng tự nhiên (0.3% - 1.2%)',
      });
    } else if ((rawDensity >= 0.15 && rawDensity < 0.3) || (rawDensity > 1.2 && rawDensity <= 1.8)) {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ cụm từ khóa dài (0.3% - 1.2%)',
        passed: false,
        score: 6,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message:
          rawDensity < 0.3
            ? `Cụm từ khóa xuất hiện hơi ít (${keywordOccurrences} lần). Khuyên dùng bổ sung thêm 1-2 lần`
            : `Cụm từ khóa xuất hiện hơi dày (${keywordOccurrences} lần). Nên đa dạng hóa bằng từ đồng nghĩa`,
      });
    } else {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ cụm từ khóa dài (0.3% - 1.2%)',
        passed: false,
        score: rawDensity < 0.15 ? 2 : 0,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message:
          rawDensity < 0.15
            ? 'Cụm từ khóa xuất hiện quá ít trong nội dung'
            : 'Cảnh báo phạt SEO: Cụm từ khóa lặp lại quá dày đặc (> 1.8%)',
      });
    }
  } else {
    // Ngưỡng cho từ khóa ngắn (< 3 từ): Chuẩn vàng 1.0% - 2.5%
    if (rawDensity >= 1.0 && rawDensity <= 2.5) {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ từ khóa (1.0% - 2.5%)',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message: 'Mật độ từ khóa đạt chuẩn vàng (1.0% - 2.5%)',
      });
    } else if ((rawDensity >= 0.5 && rawDensity < 1.0) || (rawDensity > 2.5 && rawDensity <= 3.5)) {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ từ khóa (1.0% - 2.5%)',
        passed: false,
        score: 6,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message:
          rawDensity < 1.0
            ? `Mật độ từ khóa hơi thấp (${keywordDensity}%). Khuyên dùng xuất hiện thêm 1-2 lần`
            : `Mật độ từ khóa hơi cao (${keywordDensity}%). Tránh lặp lại gây cảm giác nhồi nhét`,
      });
    } else {
      criteria.push({
        id: 'keyword_density',
        label: 'Mật độ từ khóa (1.0% - 2.5%)',
        passed: false,
        score: rawDensity < 0.5 ? 2 : 0,
        maxScore: 10,
        current: `${keywordDensity}% (${keywordOccurrences} lần)`,
        message:
          rawDensity < 0.5
            ? 'Từ khóa xuất hiện quá ít trong bài viết'
            : 'Cảnh báo phạt SEO: Mật độ từ khóa vượt ngưỡng an toàn (> 3.5%)',
      });
    }
  }

  // =========================================================================
  // 5. Tiêu chí 5: Độ dài bài viết (Word Count >= 600 từ) - Tối đa 10 điểm
  // =========================================================================
  if (wordCount >= 600) {
    criteria.push({
      id: 'word_count',
      label: 'Độ dài bài viết (>= 600 từ)',
      passed: true,
      score: 10,
      maxScore: 10,
      current: `${wordCount} từ`,
      message:
        wordCount >= 1200
          ? `Bài viết đánh giá chuyên sâu xuất sắc (${wordCount} từ)`
          : `Độ dài bài viết đạt chuẩn SEO (${wordCount} từ)`,
    });
  } else if (wordCount >= 300) {
    criteria.push({
      id: 'word_count',
      label: 'Độ dài bài viết (>= 600 từ)',
      passed: false,
      score: 5,
      maxScore: 10,
      current: `${wordCount} từ`,
      message: `Bài viết hơi ngắn (${wordCount}/600 từ), nên bổ sung thêm thông tin chi tiết`,
    });
  } else {
    criteria.push({
      id: 'word_count',
      label: 'Độ dài bài viết (>= 600 từ)',
      passed: false,
      score: 0,
      maxScore: 10,
      current: `${wordCount} từ`,
      message: `Nội dung quá ngắn (${wordCount} từ). Tối thiểu cần đạt 600 từ cho một bài viết chất lượng`,
    });
  }

  // =========================================================================
  // 6. Tiêu chí 6: Cấu trúc thẻ tiêu đề H2 & Heading Hierarchy - Tối đa 10 điểm
  // 🎯 Báo lỗi nghiêm trọng nếu phát hiện thẻ H1 bên trong editor body
  // =========================================================================
  const h2Count = h2Headings.length;
  const h2WithKeyword = h2Headings.filter((h) => {
    const normTitle = normalizeText(h.title);
    const hasFocus = normKeyword ? normTitle.includes(normKeyword) : false;
    const hasLocal = LOCAL_SEO_KEYWORDS.some((kw) => normTitle.includes(kw));
    return hasFocus || hasLocal;
  });

  if (h1InBodyCount > 0) {
    criteria.push({
      id: 'h2_structure',
      label: 'Cấu trúc tiêu đề H2 & Thứ bậc Heading',
      passed: false,
      score: 3,
      maxScore: 10,
      current: `${h1InBodyCount} thẻ H1 thừa trong body`,
      message:
        'Vi phạm cấu trúc Semantic SEO: Phát hiện thẻ H1 bên trong nội dung. Toàn bộ trang chỉ được có duy nhất 1 thẻ H1 từ Tiêu đề bài viết!',
    });
  } else if (h2Count >= 2 && h2WithKeyword.length > 0) {
    criteria.push({
      id: 'h2_structure',
      label: 'Có ít nhất 2 thẻ H2 chứa từ khóa / địa danh',
      passed: true,
      score: 10,
      maxScore: 10,
      current: `${h2Count} thẻ H2`,
      message: `Có ${h2Count} thẻ H2 và ${h2WithKeyword.length} thẻ chứa từ khóa/địa danh mục tiêu`,
    });
  } else if (h2Count >= 2) {
    criteria.push({
      id: 'h2_structure',
      label: 'Có ít nhất 2 thẻ H2 chứa từ khóa / địa danh',
      passed: false,
      score: 6,
      maxScore: 10,
      current: `${h2Count} thẻ H2`,
      message: `Đã có ${h2Count} thẻ H2 nhưng chưa có thẻ nào chứa từ khóa chính hoặc địa danh (Vinh, Nghệ An)`,
    });
  } else if (h2Count === 1) {
    criteria.push({
      id: 'h2_structure',
      label: 'Có ít nhất 2 thẻ H2 chứa từ khóa / địa danh',
      passed: false,
      score: 3,
      maxScore: 10,
      current: '1 thẻ H2',
      message: 'Chỉ có 1 thẻ H2, bài viết cần ít nhất 2 thẻ H2 để cấu trúc mạch lạc',
    });
  } else {
    criteria.push({
      id: 'h2_structure',
      label: 'Có ít nhất 2 thẻ H2 chứa từ khóa / địa danh',
      passed: false,
      score: 0,
      maxScore: 10,
      current: '0 thẻ H2',
      message: 'Bài viết chưa có thẻ H2 nào để phân đoạn nội dung',
    });
  }

  // =========================================================================
  // 7. Tiêu chí 7: Thẻ Alt của hình ảnh (Image Alts) - Tối đa 10 điểm
  // =========================================================================
  const imageCount = images.length;
  const imagesWithAlt = images.filter((img) => Boolean(img.alt && img.alt.trim()));
  const imagesWithKeyword = imagesWithAlt.filter((img) => {
    return normKeyword ? normalizeText(img.alt).includes(normKeyword) : false;
  });

  if (imageCount === 0) {
    criteria.push({
      id: 'image_alts',
      label: '100% hình ảnh có thẻ Alt',
      passed: false,
      score: 4,
      maxScore: 10,
      current: '0 ảnh',
      message: 'Bài viết chưa có hình ảnh minh họa, nên bổ sung ít nhất 1-2 hình ảnh có thẻ Alt',
    });
  } else if (imagesWithAlt.length === imageCount) {
    if (imagesWithKeyword.length > 0 || !trimmedKeyword) {
      criteria.push({
        id: 'image_alts',
        label: '100% hình ảnh có thẻ Alt',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${imagesWithAlt.length}/${imageCount} ảnh`,
        message: '100% hình ảnh có thẻ Alt và đã có ảnh chứa từ khóa chính',
      });
    } else {
      criteria.push({
        id: 'image_alts',
        label: '100% hình ảnh có thẻ Alt',
        passed: true,
        score: 8,
        maxScore: 10,
        current: `${imagesWithAlt.length}/${imageCount} ảnh`,
        message: '100% ảnh đã có thẻ Alt. Khuyến nghị thêm từ khóa chính vào Alt của 1 ảnh đại diện',
      });
    }
  } else {
    const altRatio = imageCount > 0 ? imagesWithAlt.length / imageCount : 0;
    const altScore = Math.floor(altRatio * 6);
    criteria.push({
      id: 'image_alts',
      label: '100% hình ảnh có thẻ Alt',
      passed: false,
      score: altScore,
      maxScore: 10,
      current: `${imagesWithAlt.length}/${imageCount} ảnh có Alt`,
      message: `Còn ${imageCount - imagesWithAlt.length} hình ảnh chưa có thẻ Alt mô tả`,
    });
  }

  // =========================================================================
  // 8. Tiêu chí 8: Liên kết nội bộ (Internal Links >= 2) - Tối đa 10 điểm
  // 🎯 Thẩm định URL an toàn, chống nhầm lẫn domain mạng xã hội
  // =========================================================================
  const internalLinkCount = internalLinks.length;
  if (internalLinkCount >= 2) {
    criteria.push({
      id: 'internal_links',
      label: 'Có ít nhất 2 liên kết nội bộ',
      passed: true,
      score: 10,
      maxScore: 10,
      current: `${internalLinkCount} liên kết`,
      message: `Đã có ${internalLinkCount} liên kết nội bộ trỏ tới dòng xe hoặc bài viết liên quan`,
    });
  } else if (internalLinkCount === 1) {
    criteria.push({
      id: 'internal_links',
      label: 'Có ít nhất 2 liên kết nội bộ',
      passed: false,
      score: 5,
      maxScore: 10,
      current: '1 liên kết',
      message: 'Có 1 liên kết nội bộ, khuyến nghị bổ sung thêm 1 liên kết tới trang bảng giá hoặc bài viết khác',
    });
  } else {
    criteria.push({
      id: 'internal_links',
      label: 'Có ít nhất 2 liên kết nội bộ',
      passed: false,
      score: 0,
      maxScore: 10,
      current: '0 liên kết',
      message: 'Chưa có liên kết nội bộ nào trỏ tới các trang trong website',
    });
  }

  // =========================================================================
  // 9. Tiêu chí 9: Độ dài Meta Description (120 - 160 ký tự) - Tối đa 10 điểm
  // =========================================================================
  const metaDescLength = metaDescription.trim().length;
  const hasKwInDesc = normKeyword ? normalizeText(metaDescription).includes(normKeyword) : false;

  if (metaDescLength >= 120 && metaDescLength <= 160) {
    if (hasKwInDesc || !trimmedKeyword) {
      criteria.push({
        id: 'meta_desc',
        label: 'Meta Description chuẩn (120-160 ký tự)',
        passed: true,
        score: 10,
        maxScore: 10,
        current: `${metaDescLength} ký tự`,
        message: 'Độ dài Meta Description chuẩn SEO và chứa từ khóa chính',
      });
    } else {
      criteria.push({
        id: 'meta_desc',
        label: 'Meta Description chuẩn (120-160 ký tự)',
        passed: true,
        score: 7,
        maxScore: 10,
        current: `${metaDescLength} ký tự`,
        message: 'Độ dài Meta Description đạt chuẩn nhưng chưa chứa từ khóa chính',
      });
    }
  } else if ((metaDescLength >= 80 && metaDescLength < 120) || (metaDescLength > 160 && metaDescLength <= 180)) {
    criteria.push({
      id: 'meta_desc',
      label: 'Meta Description chuẩn (120-160 ký tự)',
      passed: false,
      score: 5,
      maxScore: 10,
      current: `${metaDescLength} ký tự`,
      message:
        metaDescLength < 120
          ? `Meta Description hơi ngắn (${metaDescLength}/120 ký tự), hãy thêm lời kêu gọi hành động (CTA)`
          : `Meta Description hơi dài (${metaDescLength}/160 ký tự), có thể bị cắt bớt`,
    });
  } else {
    criteria.push({
      id: 'meta_desc',
      label: 'Meta Description chuẩn (120-160 ký tự)',
      passed: false,
      score: metaDescLength > 0 ? 2 : 0,
      maxScore: 10,
      current: `${metaDescLength} ký tự`,
      message:
        metaDescLength === 0
          ? 'Chưa nhập thẻ Meta Description'
          : 'Độ dài Meta Description không đạt chuẩn (cần 120-160 ký tự)',
    });
  }

  // =========================================================================
  // 10. Tiêu chí 10: Chống ăn thịt từ khóa (Cannibalization Guard) - Tối đa 10 điểm
  // 🎯 Tích hợp Token Similarity kiểm tra trùng lặp biến thể từ khóa
  // =========================================================================
  if (!trimmedKeyword) {
    criteria.push({
      id: 'cannibalization',
      label: 'Chống trùng lặp từ khóa chính (Cannibalization)',
      passed: false,
      score: 0,
      maxScore: 10,
      message: 'Chưa thiết lập từ khóa chính',
    });
  } else {
    // 10a. Kiểm tra trùng lặp với tên thương mại dòng xe đang bán (Risk R-08)
    const isCommercialCollision = COMMERCIAL_CAR_MODELS.some(
      (model) => normKeyword === normalizeText(model)
    );

    // 10b. Kiểm tra trùng lặp chính xác hoặc tương đồng cao (Jaccard >= 0.8) với bài đã đăng
    let conflictingPost: SeoPostSummary | undefined;
    let isHighSimilarity = false;

    for (const post of existingPosts) {
      if (currentPostId && post.id === currentPostId) continue;
      const otherKw = post.focusKeyword ? normalizeText(post.focusKeyword) : '';
      if (!otherKw) continue;

      if (otherKw === normKeyword) {
        conflictingPost = post;
        break;
      }

      // Kiểm tra độ tương đồng biến thể từ khóa
      const sim = calculateTokenSimilarity(normKeyword, otherKw);
      if (sim >= 0.8) {
        conflictingPost = post;
        isHighSimilarity = true;
        break;
      }
    }

    if (isCommercialCollision) {
      criteria.push({
        id: 'cannibalization',
        label: 'Chống trùng lặp từ khóa chính (Cannibalization)',
        passed: false,
        score: 4,
        maxScore: 10,
        current: trimmedKeyword,
        message: `Từ khóa '${trimmedKeyword}' trùng với tên thương mại dòng xe. Hãy dùng từ khóa dài hơn, ví dụ: 'Đánh giá ${trimmedKeyword} tại Nghệ An'`,
      });
    } else if (conflictingPost) {
      criteria.push({
        id: 'cannibalization',
        label: 'Chống trùng lặp từ khóa chính (Cannibalization)',
        passed: false,
        score: 0,
        maxScore: 10,
        current: conflictingPost.slug || conflictingPost.tieuDe,
        message: isHighSimilarity
          ? `Cảnh báo ăn thịt từ khóa: Từ khóa có độ tương đồng rất cao (${conflictingPost.focusKeyword}) với bài viết '${conflictingPost.tieuDe || conflictingPost.slug}'`
          : `Cảnh báo ăn thịt từ khóa: Trùng lặp chính xác với bài viết đã xuất bản '${conflictingPost.tieuDe || conflictingPost.slug}'`,
      });
    } else {
      criteria.push({
        id: 'cannibalization',
        label: 'Chống trùng lặp từ khóa chính (Cannibalization)',
        passed: true,
        score: 10,
        maxScore: 10,
        message: 'Từ khóa độc nhất, không trùng lặp với danh mục xe hoặc bài viết khác',
      });
    }
  }

  // Tổng hợp điểm và phân loại
  const totalScore = criteria.reduce((sum, item) => sum + item.score, 0);
  const maxScore = criteria.reduce((sum, item) => sum + item.maxScore, 0);

  let status: 'good' | 'needs_improvement' | 'poor' = 'poor';
  if (totalScore >= 80) {
    status = 'good';
  } else if (totalScore >= 50) {
    status = 'needs_improvement';
  }

  return {
    success: true,
    score: totalScore,
    maxScore,
    status,
    criteria,
    summary: {
      wordCount,
      readingTime,
      headingCount: headings.length,
      h1InBodyCount,
      h2Count,
      imageCount,
      imageWithAltCount: imagesWithAlt.length,
      internalLinkCount,
      keywordDensity,
      keywordOccurrences,
      isLongTail,
    },
  };
}
