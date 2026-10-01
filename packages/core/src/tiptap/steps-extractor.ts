import type { TiptapDoc, TiptapNode } from './extractor';
import { extractTextFromNode } from './extractor';

export interface ExtractedStep {
  title: string;
  description: string;
  position: number;
}

// WHY: Bộ bóc tách các bước quy trình thực tế từ Tiptap JSON AST Tree (@cardealer/core).
// Hỗ trợ cả hai cơ chế biên tập:
// 1. Khối chuyên biệt timelineStep / stepBlock từ Content Blocks Editor.
// 2. Headings văn bản dạng "Bước 1: ...", "Step 1: ..." kèm đoạn văn bản mô tả kế tiếp.
// Ngăn chặn hoàn toàn tình trạng hardcode dữ liệu giả lập vi phạm quy tắc Google Mismatched Structured Data.
export function extractStepsFromTiptap(doc: unknown): ExtractedStep[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as TiptapDoc;
  if (!Array.isArray(root.content)) return [];

  const steps: ExtractedStep[] = [];
  const nodes = root.content;

  // 1. Duyệt tìm các node chuyên biệt timelineStep / stepBlock
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    if (node.type === 'timelineStep' || node.type === 'stepBlock') {
      const attrs = node.attrs as Record<string, unknown> | undefined;
      const title = String(attrs?.title || attrs?.name || '').trim();
      const description = String(attrs?.description || attrs?.text || attrs?.content || '').trim();

      if (title) {
        steps.push({
          title,
          description: description || title,
          position: steps.length + 1,
        });
      }
    }
  }

  // 2. Nếu không có block timelineStep riêng biệt, quét các thẻ Heading H2/H3 có cấu trúc Bước/Step
  if (steps.length === 0) {
    const stepRegex = /^(?:bước|buoc|step)\s*(\d+)[:.-]?\s*(.*)$/i;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      if (node.type === 'heading') {
        const headingText = extractTextFromNode(node);
        const match = headingText.match(stepRegex);

        if (match) {
          const stepNum = parseInt(match[1] || '0', 10);
          const stepTitle = match[2]?.trim() || headingText;

          // Lấy đoạn văn bản liền kề sau heading làm mô tả bước
          let stepDesc = '';
          const nextNode = nodes[i + 1];
          if (nextNode && nextNode.type === 'paragraph') {
            stepDesc = extractTextFromNode(nextNode);
          }

          steps.push({
            title: stepTitle ? `Bước ${stepNum}: ${stepTitle}` : headingText,
            description: stepDesc || stepTitle || headingText,
            position: stepNum || steps.length + 1,
          });
        }
      }
    }
  }

  return steps;
}
