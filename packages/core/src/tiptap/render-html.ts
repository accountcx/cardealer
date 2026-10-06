import { slugifyVietnamese } from './extractor';

export interface ConvertTiptapOptions {
  hotline?: string;
  rawHotline?: string;
  zalo?: string;
}

/**
 * 🧠 Mental Model: Chuyển đổi Tiptap JSON AST Tree thành Semantic HTML giàu tính trực quan
 * Hỗ trợ 100% các khối nội dung: Headings, Callouts, Media, Galleries, Tables, FAQs, Specs, CTAs...
 * Chạy an toàn cả trên server (RSC / SSG) lẫn client, không phụ thuộc DOM.
 */
export function convertTiptapToHtml(doc: any, options?: ConvertTiptapOptions): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (!doc.content || !Array.isArray(doc.content)) return '';

  const defaultHotline = options?.hotline || '0981234567';
  const defaultRawHotline = options?.rawHotline || '0981.234.567';
  const defaultZalo = options?.zalo || defaultHotline;

  const renderNodes = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (!node) return '';
        if (node.type === 'text') {
          let text = node.text || '';
          if (node.marks && Array.isArray(node.marks)) {
            for (const mark of node.marks) {
              if (mark.type === 'bold') text = `<strong>${text}</strong>`;
              if (mark.type === 'italic') text = `<em>${text}</em>`;
              if (mark.type === 'strike') text = `<s>${text}</s>`;
              if (mark.type === 'underline') text = `<u>${text}</u>`;
              if (mark.type === 'link') {
                const href = mark.attrs?.href || '#';
                text = `<a href="${href}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
              }
            }
          }
          return text;
        }

        const innerHtml = node.content && Array.isArray(node.content) ? renderNodes(node.content) : '';

        if (node.type === 'paragraph') {
          return `<p class="my-4 text-slate-700 leading-relaxed whitespace-pre-line">${innerHtml || '<br/>'}</p>`;
        }
        if (node.type === 'heading') {
          const level = node.attrs?.level || 2;
          const isIgnored = Boolean(
            node.attrs?.ignoreToc ||
            node.attrs?.hideFromToc ||
            node.attrs?.noToc
          );
          const rawText = (innerHtml || '').replace(/<[^>]*>?/gm, '').trim();
          const id = (node.attrs?.id as string) || slugifyVietnamese(rawText) || '';
          const idAttr = id ? ` id="${id}"` : '';
          const tocClass = isIgnored ? ' ignore-toc' : '';
          const tocData = isIgnored ? ' data-toc="ignore" data-ignore-toc="true"' : '';
          const headingClass =
            level === 2
              ? 'text-2xl font-bold mt-8 mb-4 text-slate-900 border-l-4 border-blue-600 pl-3.5 scroll-mt-20'
              : 'text-xl font-bold mt-6 mb-3 text-slate-900 scroll-mt-20';
          return `<h${level}${idAttr}${tocData} class="${headingClass}${tocClass}">${innerHtml}</h${level}>`;
        }
        if (node.type === 'calloutBlock' || node.type === 'callout') {
          const type = (node.attrs?.type as string) || 'info';
          const title = node.attrs?.title || '';
          const content = node.attrs?.content || innerHtml;

          let borderClass = 'border-blue-600';
          let bgClass = 'bg-blue-50';
          let titleColor = 'text-blue-900';
          let contentColor = 'text-slate-700';
          let iconSvg = `<svg class="w-5 h-5 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

          if (type === 'warning') {
            borderClass = 'border-amber-500';
            bgClass = 'bg-amber-50';
            titleColor = 'text-amber-950';
            contentColor = 'text-amber-900';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
          } else if (type === 'success') {
            borderClass = 'border-emerald-500';
            bgClass = 'bg-emerald-50';
            titleColor = 'text-emerald-950';
            contentColor = 'text-emerald-900';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
          } else if (type === 'note') {
            borderClass = 'border-slate-400';
            bgClass = 'bg-slate-100';
            titleColor = 'text-slate-900';
            contentColor = 'text-slate-600';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
          }

          const titleHtml = title
            ? `<h4 class="font-bold text-base leading-snug tracking-tight ${titleColor}">${title}</h4>`
            : '';

          return `
            <aside class="not-prose ignore-toc my-6 rounded-r-2xl rounded-l-sm border-l-4 ${borderClass} ${bgClass} p-4.5 sm:p-5 shadow-xs transition-colors" role="${type === 'warning' ? 'alert' : 'note'}">
              <div class="flex items-start gap-3.5">
                <div class="mt-0.5 shrink-0">${iconSvg}</div>
                <div class="flex-1 space-y-1.5">
                  ${titleHtml}
                  ${content ? `<div class="text-sm leading-relaxed whitespace-pre-line ${contentColor}">${content}</div>` : ''}
                </div>
              </div>
            </aside>`;
        }
        if (node.type === 'bulletList') {
          return `<ul class="list-disc pl-6 my-4 space-y-2 text-slate-700">${innerHtml}</ul>`;
        }
        if (node.type === 'orderedList') {
          return `<ol class="list-decimal pl-6 my-4 space-y-2 text-slate-700">${innerHtml}</ol>`;
        }
        if (node.type === 'listItem') {
          return `<li>${innerHtml}</li>`;
        }
        if (node.type === 'blockquote') {
          return `<blockquote class="border-l-4 border-slate-300 pl-4 italic my-4 text-slate-600 whitespace-pre-line">${innerHtml}</blockquote>`;
        }
        if (node.type === 'image' || node.type === 'imageBlock' || node.type === 'singleImage') {
          const src = node.attrs?.src || node.attrs?.url || '';
          const alt = node.attrs?.alt || 'Hình ảnh xe Hyundai';
          const caption = node.attrs?.caption || '';
          return `
            <figure class="my-8 mx-auto max-w-4xl text-center not-prose">
              <div class="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-100 group">
                <img src="${src}" alt="${alt}" loading="lazy" class="w-full h-auto object-cover max-h-[550px] transition-transform duration-300 group-hover:scale-[1.01]" />
              </div>
              ${caption ? `<figcaption class="mt-2.5 text-center text-xs sm:text-sm text-slate-500 italic font-medium flex items-center justify-center gap-1.5"><span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>${caption}</figcaption>` : ''}
            </figure>`;
        }
        if (node.type === 'imageGallery' || node.type === 'galleryBlock') {
          const title = node.attrs?.title || 'Bộ Sưu Tập Hình Ảnh Chi Tiết';
          const layout = node.attrs?.layout || node.attrs?.style || 'slider';
          const images = (node.attrs?.images as Array<{ url: string; alt?: string; caption?: string }>) || [];
          if (!images.length) return '';

          if (layout === 'grid') {
            const gridItems = images
              .map(
                (img) => `
              <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs group">
                <img src="${img.url}" alt="${img.alt || 'Hình ảnh'}" loading="lazy" class="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
                ${img.caption ? `<p class="p-2.5 text-xs text-slate-600 text-center italic bg-slate-50 border-t border-slate-100">${img.caption}</p>` : ''}
              </div>`
              )
              .join('');
            return `
              <div class="my-8 not-prose ignore-toc" data-toc="ignore">
                ${title ? `<h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><span>📸</span> ${title}</h3>` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${gridItems}</div>
              </div>`;
          } else {
            const slides = images
              .map(
                (img, i) => `
              <div class="shrink-0 snap-center w-[85vw] sm:w-[380px] rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm flex flex-col group">
                <div class="relative overflow-hidden aspect-[16/10] bg-slate-100">
                  <img src="${img.url}" alt="${img.alt || 'Hình ảnh'}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">${i + 1}/${images.length}</span>
                </div>
                ${img.caption ? `<div class="p-3 text-xs text-slate-600 italic bg-white border-t border-slate-100">${img.caption}</div>` : ''}
              </div>`
              )
              .join('');
            return `
              <div class="my-8 not-prose ignore-toc" data-toc="ignore">
                <div class="flex items-center justify-between mb-3">
                  ${title ? `<h3 class="text-xl font-bold text-slate-900 flex items-center gap-2"><span>📸</span> ${title}</h3>` : ''}
                  <span class="text-xs text-slate-400 font-medium hidden sm:inline">👈 Vuốt ngang để xem thêm 👉</span>
                </div>
                <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 scrollbar-thin scrollbar-thumb-slate-300">${slides}</div>
              </div>`;
          }
        }
        if (node.type === 'specTable' || node.type === 'specComparisonBlock') {
          const title = node.attrs?.title || 'Bảng So Sánh Thông Số Kỹ Thuật';
          const versions = (node.attrs?.versions as string[]) || [];
          const rows = (node.attrs?.rows as Array<{ specName: string; values: string[] }>) || [];
          if (!versions.length || !rows.length) return '';

          const headerCols = versions
            .map((v) => `<th class="py-3.5 px-4 font-bold text-center text-white bg-[#002C6C] border-l border-blue-900/50 min-w-[160px]">${v}</th>`)
            .join('');
          const bodyRows = rows
            .map((r, idx) => {
              const isEven = idx % 2 === 0;
              const cells = (r.values || [])
                .map((val) => `<td class="py-3 px-4 text-center text-xs sm:text-sm text-slate-700 border-l border-slate-200">${val || '-'}</td>`)
                .join('');
              return `
                <tr class="${isEven ? 'bg-slate-50/70' : 'bg-white'} border-b border-slate-200/80 hover:bg-blue-50/40 transition-colors">
                  <td class="py-3 px-4 font-semibold text-xs sm:text-sm text-slate-900 min-w-[140px] sticky left-0 ${isEven ? 'bg-slate-50' : 'bg-white'} shadow-[2px_0_5px_rgba(0,0,0,0.03)]">${r.specName}</td>
                  ${cells}
                </tr>`;
            })
            .join('');

          return `
            <div class="my-8 not-prose">
              <h3 class="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">${title}</h3>
              <div class="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-md bg-white scrollbar-thin">
                <table class="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr>
                      <th class="py-3.5 px-4 font-bold text-white bg-[#001A44] min-w-[140px] sticky left-0 z-10">Thông Số / Tính Năng</th>
                      ${headerCols}
                    </tr>
                  </thead>
                  <tbody>${bodyRows}</tbody>
                </table>
              </div>
              <p class="text-xs text-slate-400 mt-2 italic">* Thông số kỹ thuật có thể được điều chỉnh theo công bố mới nhất từ nhà sản xuất.</p>
            </div>`;
        }
        if (node.type === 'ctaButton' || node.type === 'ctaButtonBlock') {
          const buttonText = node.attrs?.buttonText || 'Liên Hệ Tư Vấn Ngay';
          const actionType = node.attrs?.actionType || 'hotline';
          const customUrl = node.attrs?.customUrl || '';
          const customPhone = ((node.attrs?.phoneNumber as string) || '').trim();
          const targetHotline = (customPhone ? customPhone.replace(/\D/g, '') : '') || defaultHotline;
          const targetZalo = (customPhone ? customPhone.replace(/\D/g, '') : '') || defaultZalo;
          const subtext = node.attrs?.subtext || '';
          const variant = node.attrs?.variant || 'red';

          let href = '#';
          let targetAttr = '';
          let onClickAttr = '';

          if (actionType === 'hotline') {
            href = `tel:${targetHotline}`;
          } else if (actionType === 'zalo') {
            href = `https://zalo.me/${targetZalo}`;
            targetAttr = 'target="_blank" rel="noopener noreferrer"';
          } else if (actionType === 'quoteForm') {
            href = '#lead-form';
            onClickAttr = 'onclick="document.getElementById(\'lead-form\')?.scrollIntoView({behavior:\'smooth\'})"';
          } else if (actionType === 'customLink') {
            href = customUrl || '#';
            targetAttr = 'target="_blank" rel="noopener noreferrer"';
          }

          let btnColor = 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/25';
          if (variant === 'blue') {
            btnColor = 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-blue-500/25';
          } else if (variant === 'emerald') {
            btnColor = 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-500/25';
          }

          const cleanButtonText = buttonText.replace(/^\📞\s*/, '');

          return `
            <div class="my-8 mx-auto max-w-lg text-center not-prose ignore-toc p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <a href="${href}" ${targetAttr} ${onClickAttr} class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${btnColor}">
                <span>${cleanButtonText}</span>
              </a>
              ${subtext ? `<p class="mt-2 text-xs text-slate-500 font-medium whitespace-pre-line">${subtext}</p>` : ''}
            </div>`;
        }
        if (node.type === 'prosCons' || node.type === 'prosConsBlock') {
          const title = node.attrs?.title || 'Đánh Giá Ưu & Nhược Điểm';
          const pros = (node.attrs?.pros as string[]) || [];
          const cons = (node.attrs?.cons as string[]) || [];

          const prosList = pros
            .filter(Boolean)
            .map(
              (p) => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
              <span class="leading-relaxed font-medium whitespace-pre-line">${p}</span>
            </li>`
            )
            .join('');

          const consList = cons
            .filter(Boolean)
            .map(
              (c) => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
              <span class="leading-relaxed font-medium whitespace-pre-line">${c}</span>
            </li>`
            )
            .join('');

          return `
            <div class="my-8 not-prose">
              <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">${title}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 shadow-xs">
                  <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-emerald-200">
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                      👍 Ưu Điểm
                    </span>
                    <span class="text-xs text-emerald-800 font-bold">(${pros.length} điểm mạnh)</span>
                  </div>
                  <ul class="space-y-2.5">${prosList || '<li class="text-xs text-slate-400 italic">Đang cập nhật ưu điểm...</li>'}</ul>
                </div>
                <div class="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/90 shadow-xs">
                  <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-rose-200">
                    <span class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                      👎 Nhược Điểm
                    </span>
                    <span class="text-xs text-rose-800 font-bold">(${cons.length} điểm lưu ý)</span>
                  </div>
                  <ul class="space-y-2.5">${consList || '<li class="text-xs text-slate-400 italic">Đang cập nhật nhược điểm...</li>'}</ul>
                </div>
              </div>
            </div>`;
        }
        if (node.type === 'faqBlock') {
          const questions = (node.attrs?.questions as Array<{ question: string; answer: string }>) || [];
          if (!questions.length) return '';
          const title = (node.attrs?.title as string) || (node.attrs?.headline as string) || '';
          const faqItems = questions
            .map(
              (q, i) => `
            <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mb-3">
              <div class="font-bold text-slate-900 flex items-center gap-2 mb-2 text-base">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0 font-bold">${i + 1}</span>
                ${q.question || 'Câu hỏi'}
              </div>
              <p class="text-slate-600 text-sm pl-8 leading-relaxed whitespace-pre-line">${q.answer || 'Nội dung câu trả lời đang được cập nhật...'}</p>
            </div>`
            )
            .join('');
          return `
            <div class="my-8 not-prose ignore-toc" data-toc="ignore">
              ${title ? `<h3 class="text-xl font-bold text-slate-900 mb-4">${title}</h3>` : ''}
              <div class="space-y-3">${faqItems}</div>
            </div>`;
        }
        if (node.type === 'youtubeBlock') {
          const videoId = node.attrs?.videoId || '';
          const caption = node.attrs?.caption || '';
          return `
            <figure class="my-8 not-prose ignore-toc" data-toc="ignore">
              <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-md">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/${videoId}"
                  title="YouTube video player"
                  class="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              ${caption ? `<figcaption class="text-center text-xs text-slate-500 mt-2 italic">${caption}</figcaption>` : ''}
            </figure>`;
        }
        if (node.type === 'tikTokBlock') {
          const videoId = node.attrs?.videoId || '';
          const title = node.attrs?.title || '';
          return `
            <div class="my-8 not-prose ignore-toc p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center" data-toc="ignore">
              <p class="text-sm font-semibold text-slate-800 mb-2">🎬 ${title || 'Xem trên TikTok'}</p>
              <a href="https://www.tiktok.com/@hyundai/video/${videoId}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">
                Mở video TikTok (#${videoId}) &rarr;
              </a>
            </div>`;
        }
        if (node.type === 'relatedCarBlock') {
          const carName = node.attrs?.carName || node.attrs?.tenXe || 'Hyundai Accent';
          const carSlug = node.attrs?.carSlug || node.attrs?.slug || 'accent';
          const minPrice = Number(node.attrs?.carPrice || node.attrs?.minPrice || node.attrs?.giaNiemYetTu) || 0;
          const imageUrl =
            node.attrs?.carImage ||
            node.attrs?.imageUrl ||
            node.attrs?.anhDaiDienUrl ||
            'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Accent-icon.webp?_a=BAMAABkS0';
          const seatCount = Number(node.attrs?.seatCount) || 5;
          const fuelType = node.attrs?.fuelType || 'Xăng 1.5L Smartstream';
          const formattedPrice = minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ';
          return `
            <div class="my-8 not-prose ignore-toc p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-blue-50/60 via-white to-slate-50 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="w-full sm:w-48 md:w-56 h-36 rounded-xl bg-slate-100/80 flex items-center justify-center p-2.5 shrink-0 overflow-hidden border border-slate-200/70">
                <img
                  src="${imageUrl}"
                  alt="${carName}"
                  class="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onerror="this.onerror=null;this.src='https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Accent-icon.webp?_a=BAMAABkS0';"
                />
              </div>
              <div class="flex-1 min-w-0 w-full space-y-1.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] sm:text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2.5 py-0.5 rounded-full inline-block">
                    Mẫu xe quan tâm
                  </span>
                  <span class="text-[10px] sm:text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Sẵn xe giao ngay
                  </span>
                </div>
                <h4 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  <a href="/xe/${carSlug}" class="hover:text-blue-600 transition-colors">
                    ${carName}
                  </a>
                </h4>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 pt-0.5">
                  <span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">💺 ${seatCount} chỗ ngồi</span>
                  <span class="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">⛽ ${fuelType}</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-600 pt-0.5">
                  Giá niêm yết từ: <strong class="text-rose-600 font-bold text-sm sm:text-base">${formattedPrice}</strong>
                </p>
                <div class="pt-1.5">
                  <a
                    href="/xe/${carSlug}"
                    class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow active:scale-95"
                  >
                    <span>Xem chi tiết xe</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>`;
        }
        if (node.type === 'priceTableBlock') {
          const title = node.attrs?.title || 'Bảng Giá Xe Hyundai Mới Nhất';
          const prices = (node.attrs?.prices as any[]) || [];
          let tableHtml = '';
          if (Array.isArray(prices) && prices.length > 0) {
            const rows = prices
              .map((p) => {
                const version = p.version || p.name || 'Phiên bản';
                const listed = Number(p.listedPrice || p.price || 0);
                const listedStr = listed > 0 ? `${listed.toLocaleString('vi-VN')}&nbsp;₫` : 'Liên hệ';
                const disc = Number(p.discount || 0);
                const discStr = disc > 0
                  ? `-${disc.toLocaleString('vi-VN')}&nbsp;₫`
                  : '<span class="text-slate-400 font-normal">Liên hệ</span>';
                const rolling = Number(p.rollingPrice || p.onRoadPriceEstimate || 0);
                const rollingStr = rolling > 0 ? `${rolling.toLocaleString('vi-VN')}&nbsp;₫` : 'Liên hệ';
                const cleanVersionEscaped = version.replace(/'/g, "\\'");

                return `
                  <tr class="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-slate-900 text-left align-middle">
                      <div class="leading-snug">${version}</div>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-slate-600 font-mono text-sm align-middle">
                      ${listedStr}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-emerald-600 font-semibold font-mono text-sm align-middle">
                      ${discStr}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-blue-700 font-bold font-mono text-base align-middle">
                      ${rollingStr}
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onclick="
                          const form = document.getElementById('lead-form') || document.querySelector('[data-role=\\'lead-form\\']') || document.querySelector('form');
                          if (form) {
                            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            const inp = form.querySelector('input[type=\\'tel\\'], input[name=\\'phone\\'], input');
                            if (inp) {
                              setTimeout(() => {
                                inp.focus();
                                inp.setAttribute('placeholder', 'Nhận báo giá ${cleanVersionEscaped}...');
                              }, 400);
                            }
                          } else {
                            window.open('https://zalo.me/${defaultZalo}', '_blank');
                          }
                        "
                        class="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
                        title="Nhận báo giá lăn bánh chi tiết cho ${cleanVersionEscaped}"
                      >
                        Báo giá
                      </button>
                    </td>
                  </tr>`;
              })
              .join('');

            tableHtml = `
              <div class="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                <table class="w-full text-sm border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
                    <tr>
                      <th class="py-3.5 px-4 text-left w-[36%] min-w-[200px]">Phiên Bản Xe</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Giá Niêm Yết</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Ưu Đãi Đại Lý</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Giá Lăn Bánh Tạm Tính</th>
                      <th class="py-3.5 px-4 text-center whitespace-nowrap w-[110px]">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>`;
          }

          return `
            <div class="my-8 not-prose ignore-toc p-4 sm:p-6 rounded-2xl border border-blue-200/80 bg-blue-50/40 shadow-xs" data-toc="ignore">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  ${title}
                </h3>
                <span class="text-xs text-blue-700 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Báo giá cập nhật mới nhất
                </span>
              </div>
              ${tableHtml}
              <p class="text-xs text-slate-500 mt-2">* Giá lăn bánh tạm tính đã bao gồm VAT, lệ phí trước bạ, biển số và phí đường bộ. Giá thực tế có thể giảm sâu hơn tùy chính sách ưu đãi tháng.</p>
            </div>`;
        }
        if (node.type === 'leadFormBlock' || node.type === 'inlineQuickForm' || node.type === 'leadForm') {
          return '';
        }
        if (node.type === 'gatedContent') {
          const ctaTitle = (node.attrs?.title || 'Nhận Báo Giá Lăn Bánh Ưu Đãi').replace(/^\📞\s*/, '');
          return `
            <div class="my-8 mx-auto max-w-lg text-center not-prose p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <a href="tel:${defaultHotline}" class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/25">
                <span>${ctaTitle}</span>
              </a>
            </div>`;
        }
        if (node.type === 'horizontalRule') {
          return `<hr class="my-8 border-slate-200" />`;
        }

        return innerHtml;
      })
      .join('');
  };

  return renderNodes(doc.content);
}
