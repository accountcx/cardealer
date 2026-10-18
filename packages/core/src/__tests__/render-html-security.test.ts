import { describe, it, expect } from 'vitest';
import { convertTiptapToHtml } from '../tiptap/render-html';

describe('convertTiptapToHtml Security & Sanitization (XSS Prevention)', () => {
  it('escapes raw HTML tags and dangerous characters in text nodes', () => {
    const maliciousDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '<script>alert("XSS")</script>&"test\'',
            },
          ],
        },
      ],
    };

    const html = convertTiptapToHtml(maliciousDoc);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&quot;test&#39;');
  });

  it('blocks javascript: and unsafe protocols in link marks', () => {
    const maliciousDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Click here for free car',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'javascript:alert(document.cookie)',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const html = convertTiptapToHtml(maliciousDoc);
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="#"');
  });

  it('blocks quote breakouts and escapes attributes in custom blocks (e.g. callout and ctaButton)', () => {
    const maliciousDoc = {
      type: 'doc',
      content: [
        {
          type: 'callout',
          attrs: {
            type: 'warning',
            title: '"><script>alert(1)</script>',
            content: 'Safe content',
          },
        },
        {
          type: 'ctaButton',
          attrs: {
            actionType: 'customLink',
            customUrl: 'javascript:steal()',
            buttonText: '"><img src=x onerror=alert(2)>',
          },
        },
      ],
    };

    const html = convertTiptapToHtml(maliciousDoc);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x onerror=alert(2)>');
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes version strings and prevents attribute breakout in priceTableBlock onclick', () => {
    const maliciousDoc = {
      type: 'doc',
      content: [
        {
          type: 'priceTableBlock',
          attrs: {
            title: 'Bảng giá',
            prices: [
              {
                version: 'Tucson 2.0" onclick="alert(1);',
                listedPrice: 800000000,
                discount: 20000000,
                rollingPrice: 890000000,
              },
            ],
          },
        },
      ],
    };

    const html = convertTiptapToHtml(maliciousDoc);
    expect(html).not.toContain('onclick="alert(1);');
  });
});
