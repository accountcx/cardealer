import { describe, it, expect } from 'vitest';
import {
  parseTextToTiptapContent,
  formatTiptapContentToMarkdown,
  isInternalLink,
  convertTiptapToHtml,
} from '../index';

describe('Tiptap Internal Links Engine (US-04)', () => {
  describe('TC-11: Markdown Links Parsing to Tiptap AST Nodes', () => {
    it('chuyển đổi văn bản chứa 1 liên kết nội bộ thành text nodes với mark link', () => {
      const input = 'Xem ngay [Bảng Giá Xe](/bang-gia-xe) mới nhất hôm nay.';
      const nodes = parseTextToTiptapContent(input);

      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toEqual({ type: 'text', text: 'Xem ngay ' });
      expect(nodes[1]).toEqual({
        type: 'text',
        text: 'Bảng Giá Xe',
        marks: [{ type: 'link', attrs: { href: '/bang-gia-xe' } }],
      });
      expect(nodes[2]).toEqual({ type: 'text', text: ' mới nhất hôm nay.' });
    });

    it('chuyển đổi nhiều liên kết nội bộ trong cùng một đoạn văn', () => {
      const input = 'So sánh giữa [Hyundai Santa Fe](/dong-xe/santa-fe) và [Hyundai Tucson](/dong-xe/tucson) chi tiết.';
      const nodes = parseTextToTiptapContent(input);

      expect(nodes).toHaveLength(5);
      expect(nodes[0].text).toBe('So sánh giữa ');
      expect(nodes[1]).toEqual({
        type: 'text',
        text: 'Hyundai Santa Fe',
        marks: [{ type: 'link', attrs: { href: '/dong-xe/santa-fe' } }],
      });
      expect(nodes[2].text).toBe(' và ');
      expect(nodes[3]).toEqual({
        type: 'text',
        text: 'Hyundai Tucson',
        marks: [{ type: 'link', attrs: { href: '/dong-xe/tucson' } }],
      });
      expect(nodes[4].text).toBe(' chi tiết.');
    });

    it('xử lý liên kết ở đầu câu và cuối câu', () => {
      const inputAtStart = '[Dự Toán Chi Phí](/du-toan-chi-phi) lăn bánh Hyundai.';
      const nodesStart = parseTextToTiptapContent(inputAtStart);
      expect(nodesStart[0]).toEqual({
        type: 'text',
        text: 'Dự Toán Chi Phí',
        marks: [{ type: 'link', attrs: { href: '/du-toan-chi-phi' } }],
      });
      expect(nodesStart[1].text).toBe(' lăn bánh Hyundai.');

      const inputAtEnd = 'Liên hệ ngay với chúng tôi qua [Trang Liên Hệ](/lien-he)';
      const nodesEnd = parseTextToTiptapContent(inputAtEnd);
      expect(nodesEnd[0].text).toBe('Liên hệ ngay với chúng tôi qua ');
      expect(nodesEnd[1]).toEqual({
        type: 'text',
        text: 'Trang Liên Hệ',
        marks: [{ type: 'link', attrs: { href: '/lien-he' } }],
      });
    });

    it('bảo toàn văn bản thuần không có liên kết (backward compatibility)', () => {
      const plainText = 'Đây là đoạn văn bản thông thường không có bất kỳ liên kết nào.';
      const nodes = parseTextToTiptapContent(plainText);
      expect(nodes).toEqual([{ type: 'text', text: plainText }]);
    });

    it('xử lý chuỗi rỗng an toàn', () => {
      const nodes = parseTextToTiptapContent('');
      expect(nodes).toEqual([{ type: 'text', text: '' }]);
    });
  });

  describe('TC-12: Roundtrip Serialization / Deserialization Fidelity', () => {
    it('tái tạo nguyên vẹn chuỗi markdown từ Tiptap content nodes', () => {
      const originalText = 'Tham khảo [Bảng Giá Xe](/bang-gia-xe) và liên hệ [Showroom](/lien-he) để nhận khuyến mãi.';
      const nodes = parseTextToTiptapContent(originalText);
      const reconstructed = formatTiptapContentToMarkdown(nodes);

      expect(reconstructed).toBe(originalText);
    });

    it('bảo toàn nguyên vẹn đoạn văn thuần không có link qua roundtrip', () => {
      const original = 'Hyundai Accent 2026 sở hữu thiết kế hiện đại và tiết kiệm nhiên liệu tối ưu.';
      const nodes = parseTextToTiptapContent(original);
      const reconstructed = formatTiptapContentToMarkdown(nodes);

      expect(reconstructed).toBe(original);
    });
  });

  describe('TC-13: Storefront HTML Rendering & Internal vs External Link Behavior', () => {
    it('render liên kết nội bộ chuẩn SEO: không có target="_blank" và không có rel="noopener/nofollow"', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: parseTextToTiptapContent('Xem ngay [Bảng Giá Xe](/bang-gia-xe) mới nhất.'),
          },
        ],
      };

      const html = convertTiptapToHtml(doc);

      // Thẻ link nội bộ phải có href="/bang-gia-xe"
      expect(html).toContain('href="/bang-gia-xe"');
      // Thẻ link nội bộ phải có styling chuẩn SEO
      expect(html).toContain('class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"');
      // Thẻ link nội bộ KHÔNG được chứa target="_blank" hoặc rel="noopener noreferrer"
      expect(html).not.toContain('target="_blank"');
      expect(html).not.toContain('rel="noopener noreferrer"');
      expect(html).not.toContain('rel="nofollow"');
    });

    it('render liên kết ngoài: giữ nguyên target="_blank" và rel="noopener noreferrer"', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: parseTextToTiptapContent('Truy cập trang chủ Hyundai toàn cầu tại [Hyundai Global](https://www.hyundai.com).'),
          },
        ],
      };

      const html = convertTiptapToHtml(doc);

      expect(html).toContain('href="https://www.hyundai.com"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it('phân biệt chính xác isInternalLink cho các trường hợp', () => {
      expect(isInternalLink('/dong-xe/santa-fe')).toBe(true);
      expect(isInternalLink('/bang-gia-xe')).toBe(true);
      expect(isInternalLink('#section-specs')).toBe(true);
      expect(isInternalLink('https://google.com')).toBe(false);
      expect(isInternalLink('http://example.com')).toBe(false);
      expect(isInternalLink('javascript:alert(1)')).toBe(false);
    });
  });

  describe('TC-14: Security & XSS Sanitization in Markdown Links', () => {
    it('chặn đứng pseudo-protocol nguy hại (javascript:) trong link URL', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: parseTextToTiptapContent('Bấm vào [Độc hại](javascript:alert("XSS")) ngay.'),
          },
        ],
      };

      const html = convertTiptapToHtml(doc);

      expect(html).not.toContain('javascript:');
      expect(html).toContain('href="#"');
    });

    it('escape ký tự HTML đặc biệt trong anchor text chống Stored XSS', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: parseTextToTiptapContent('Xem [<img src=x onerror=alert(1)>](/dong-xe/creta).'),
          },
        ],
      };

      const html = convertTiptapToHtml(doc);

      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });
  });
});
