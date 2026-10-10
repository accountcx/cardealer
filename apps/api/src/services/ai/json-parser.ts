import type { FullArticleResult, FullArticleBlock } from '@cardealer/types';

// WHY: Trích xuất và sửa lỗi JSON 4 tầng (parse trực tiếp -> bóc tách fence block -> cắt cặp ngoặc ngoài cùng -> tự động đóng chuỗi và ngoặc bị cắt do token limit).
export function extractAndParseJson<T = unknown>(raw: string): T | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Parse trực tiếp
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Tiếp tục fallback tầng 2
  }

  // 2. Bóc tách code block ```json ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // Tiếp tục fallback tầng 3
    }
  }

  // 3. Tìm cặp ngoặc { ... } hoặc [ ... ] ngoài cùng
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      // Tiếp tục fallback tầng 4
    }
  }

  // 4. Tự động sửa chữa JSON bị cắt ngang do token limit (cân bằng dấu ngoặc kép và stack ngoặc)
  if (firstBrace !== -1) {
    try {
      let candidate = trimmed.slice(firstBrace);
      const stack: string[] = [];
      let inString = false;
      let escaped = false;
      for (let i = 0; i < candidate.length; i++) {
        const char = candidate[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') stack.push('}');
          else if (char === '[') stack.push(']');
          else if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) {
              stack.pop();
            }
          }
        }
      }
      if (inString) candidate += '"';
      while (stack.length > 0) {
        candidate += stack.pop();
      }
      return JSON.parse(candidate) as T;
    } catch {
      // Bỏ qua nếu không thể cứu vãn
    }
  }

  return null;
}

// WHY: Fallback chuyển đổi văn bản thường / Markdown sang cấu trúc FullArticleResult nếu AI trả về định dạng plain text thay vì JSON.
export function fallbackTextToFullArticle(text: string, titleHint: string, keywordHint: string): FullArticleResult {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks: FullArticleBlock[] = [];
  let currentParagraph = '';

  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', content: currentParagraph });
        currentParagraph = '';
      }
      const level = line.startsWith('### ') ? 3 : 2;
      const content = line.replace(/^#{2,3}\s*/, '');
      blocks.push({ type: 'heading', level, content });
    } else {
      currentParagraph = currentParagraph ? `${currentParagraph}\n${line}` : line;
    }
  }
  if (currentParagraph) {
    blocks.push({ type: 'paragraph', content: currentParagraph });
  }

  const finalBlocks = blocks.length > 0 ? blocks : [{ type: 'paragraph', content: text }];
  const firstP = finalBlocks.find((b) => b.type === 'paragraph')?.content || '';

  return {
    title: titleHint || (lines[0] ? lines[0].replace(/^#*\s*/, '') : 'Bài viết tư vấn mua xe Hyundai chính hãng'),
    summary: firstP.slice(0, 220),
    focusKeyword: keywordHint,
    metaTitle: (titleHint || 'Đánh giá xe Hyundai').slice(0, 60),
    metaDescription: firstP.slice(0, 155),
    suggestedKeywords: [keywordHint],
    blocks: finalBlocks,
  };
}

// WHY: Chuẩn hóa tiêu đề bài viết: Viết hoa danh từ riêng, chữ cái đầu, loại bỏ dấu hai chấm máy móc để đạt văn phong tự nhiên.
export function cleanAndFormatTitle(rawTitle: string, carName: string): string {
  let title = (rawTitle || '').trim();
  if (!title) return `Đánh Giá Xe ${carName} Mới Nhất`;

  // Viết hoa chữ cái đầu tiên
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Chuẩn hóa tên xe thành chữ hoa đúng chuẩn (ví dụ "hyundai creta" -> "Hyundai Creta")
  const normCar = carName.trim();
  if (normCar) {
    const escaped = normCar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    title = title.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), normCar);
  }
  title = title.replace(/\bhyundai\b/gi, 'Hyundai');

  // Nếu tiêu đề bị ghép máy móc dạng "[Từ khóa]: [Mô tả ngắn]", thay thế dấu hai chấm bằng dấu gạch ngang mượt mà
  if (/^[^:]{8,40}:\s*/.test(title)) {
    title = title.replace(/^([^:]{8,40}):\s*/, (_match, prefix) => `${prefix.trim()} - `);
  }

  return title;
}
