// 🧠 Mental Model: Quản lý bóc tách và tái tạo liên kết Markdown & Tiptap Link Mark AST.
// Đảm bảo tính toàn vẹn 2 chiều (Roundtrip) giữa cú pháp Markdown [anchor](url)
// và cấu trúc Tiptap Mark Link { type: "link", attrs: { href: "..." } }.

export interface TiptapTextMark {
  type: string;
  attrs?: Record<string, any>;
}

export interface TiptapTextNode {
  type: 'text';
  text: string;
  marks?: TiptapTextMark[];
}

/**
 * Phân tích chuỗi văn bản thuần chứa cú pháp Markdown [anchor](url)
 * thành mảng các Tiptap Text Nodes với mark 'link' tương ứng.
 */
export function parseTextToTiptapContent(rawText: string): TiptapTextNode[] {
  if (!rawText || typeof rawText !== 'string') {
    return [{ type: 'text', text: '' }];
  }

  const nodes: TiptapTextNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    const matchIndex = match.index;
    const fullMatch = match[0];
    const anchorText = match[1];
    const rawUrl = match[2].trim();

    // Văn bản phía trước liên kết
    if (matchIndex > lastIndex) {
      const leadingText = rawText.substring(lastIndex, matchIndex);
      if (leadingText) {
        nodes.push({ type: 'text', text: leadingText });
      }
    }

    // Nếu anchor hoặc url rỗng, giữ nguyên text
    if (!anchorText.trim() || !rawUrl) {
      nodes.push({ type: 'text', text: fullMatch });
    } else {
      nodes.push({
        type: 'text',
        text: anchorText,
        marks: [
          {
            type: 'link',
            attrs: {
              href: rawUrl,
            },
          },
        ],
      });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Phần văn bản còn lại sau liên kết cuối cùng
  if (lastIndex < rawText.length) {
    const trailingText = rawText.substring(lastIndex);
    if (trailingText) {
      nodes.push({ type: 'text', text: trailingText });
    }
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: rawText }];
}

/**
 * Tái cấu trúc mảng Tiptap content nodes thành chuỗi văn bản Markdown nguyên vẹn.
 * Nếu child node có mark 'link', tái tạo lại cú pháp [text](url).
 */
export function formatTiptapContentToMarkdown(content: any[]): string {
  if (!content || !Array.isArray(content)) return '';

  return content
    .map((node) => {
      if (!node) return '';
      const text = typeof node.text === 'string' ? node.text : '';

      if (node.marks && Array.isArray(node.marks)) {
        const linkMark = node.marks.find((m: any) => m && m.type === 'link');
        if (linkMark && linkMark.attrs?.href) {
          return `[${text}](${linkMark.attrs.href})`;
        }
      }

      return text;
    })
    .join('');
}
