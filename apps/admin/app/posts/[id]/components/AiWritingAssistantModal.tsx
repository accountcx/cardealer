'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ListTree,
  FileText,
  Search,
  HelpCircle,
  Check,
  Copy,
  Layers,
  ListPlus,
  RefreshCw,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Table,
  Car,
  CheckSquare,
  MessageSquare,
  MousePointerClick,
  Video,
  ArrowRight,
} from 'lucide-react';
import { Modal, Button, Card, Input } from '@cardealer/ui';
import { aiService } from '../../../../services/ai.service';
import type { CarSummary } from '../../../../services/catalog.service';
import type {
  AiAction,
  OutlineItem,
  FaqItem,
  SeoOptimizationResult,
  FullArticleResult,
} from '@cardealer/types';

export interface AiWritingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentKeyword: string;
  currentBlocksText: string;
  availableCars?: CarSummary[];
  onInsertFullArticle?: (article: FullArticleResult) => void;
  onInsertOutline: (outline: OutlineItem[]) => void;
  onInsertFaqs: (faqs: FaqItem[]) => void;
  onAppendText: (text: string) => void;
  onApplySeo: (seo: SeoOptimizationResult) => void;
}

type AiTab = 'full' | 'outline' | 'continue' | 'seo' | 'faq';

// 🧠 Mental Model: Trợ Lý AI Viết Bài & Tối Ưu SEO Toàn Diện (Cyborg Content Engine).
// Hỗ trợ:
// 1. Viết toàn bộ bài viết từ A-Z với 14 Content Block tinh hoa & Hybrid Showroom Inventory
// 2. Pipeline 2-Bước: Tạo Dàn Ý -> 1-Click Viết toàn bộ bài viết chi tiết theo dàn ý
// 3. Viết tiếp đoạn văn thông số kỹ thuật & trải nghiệm
// 4. Tối ưu SEO On-page: sinh Meta Title, Meta Description, từ khóa LSI
// 5. Sinh khối FAQ chuẩn Schema FAQPage cho Local SEO & YMYL
export function AiWritingAssistantModal({
  isOpen,
  onClose,
  currentTitle,
  currentKeyword,
  currentBlocksText,
  availableCars = [],
  onInsertFullArticle,
  onInsertOutline,
  onInsertFaqs,
  onAppendText,
  onApplySeo,
}: AiWritingAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<AiTab>('full');

  // Input states
  const [prompt, setPrompt] = useState('');
  const [carModel, setCarModel] = useState('');
  const [location, setLocation] = useState('Nghệ An & Hà Tĩnh');
  const [keyword, setKeyword] = useState('');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Result states
  const [fullArticleResult, setFullArticleResult] = useState<FullArticleResult | null>(null);
  const [outlineResult, setOutlineResult] = useState<OutlineItem[] | null>(null);
  const [textResult, setTextResult] = useState<string | null>(null);
  const [seoResult, setSeoResult] = useState<SeoOptimizationResult | null>(null);
  const [faqResult, setFaqResult] = useState<FaqItem[] | null>(null);

  // Sync inputs when opening or props change
  useEffect(() => {
    if (isOpen) {
      if (currentTitle && !prompt) {
        setPrompt(currentTitle);
      }
      if (currentKeyword && !keyword) {
        setKeyword(currentKeyword);
      }
      // Heuristic car model extraction from title or availableCars
      const lower = (currentTitle || '').toLowerCase();
      if (lower.includes('accent')) setCarModel('Hyundai Accent');
      else if (lower.includes('creta')) setCarModel('Hyundai Creta');
      else if (lower.includes('tucson')) setCarModel('Hyundai Tucson');
      else if (lower.includes('santa fe') || lower.includes('santafe')) setCarModel('Hyundai Santa Fe');
      else if (lower.includes('custin')) setCarModel('Hyundai Custin');
      else if (lower.includes('palisade')) setCarModel('Hyundai Palisade');
      else if (lower.includes('i10') || lower.includes('grand i10')) setCarModel('Hyundai Grand i10');
      else if (lower.includes('stargazer')) setCarModel('Hyundai Stargazer');
      else if (lower.includes('elantra')) setCarModel('Hyundai Elantra');
      else if (lower.includes('ioniq')) setCarModel('Hyundai Ioniq 5');
    }
  }, [isOpen, currentTitle, currentKeyword]);

  const handleRunAi = async (action: AiAction, overrideContext?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      const data = await aiService.generate({
        action,
        prompt: prompt || currentTitle || 'Bài viết tư vấn mua xe ô tô Hyundai chính hãng',
        context: overrideContext || currentBlocksText || undefined,
        keyword: keyword || currentKeyword || undefined,
        carModel: carModel || undefined,
        location: location || undefined,
        availableCars:
          availableCars && availableCars.length > 0
            ? availableCars.map((c) => ({
                id: c.id,
                tenXe: c.tenXe,
                slug: c.slug,
                minPrice: c.minPrice,
                anhDaiDienUrl: c.anhDaiDienUrl,
                seatRange: c.seatRange,
                fuelType: c.fuelType,
              }))
            : undefined,
      });

      if (data?.fullArticle) {
        setFullArticleResult(data.fullArticle);
      } else if (action === 'generate_full_article' && (data?.text || data?.rawText)) {
        // Client fallback nếu API chỉ trả về text
        const textContent = data.rawText || data.text || '';
        setFullArticleResult({
          title: prompt || currentTitle || 'Bài viết tư vấn mua xe Hyundai',
          summary: textContent.slice(0, 200),
          focusKeyword: keyword || currentKeyword || 'xe hyundai',
          metaTitle: (prompt || 'Đánh giá xe Hyundai').slice(0, 60),
          metaDescription: textContent.slice(0, 150),
          suggestedKeywords: [keyword || 'xe hyundai'],
          blocks: [{ type: 'paragraph', content: textContent }],
        });
      }

      if (data?.outline) {
        setOutlineResult(data.outline);
      }
      if (data?.text) {
        setTextResult(data.text);
      }
      if (data?.seo) {
        setSeoResult(data.seo);
      }
      if (data?.faqs) {
        setFaqResult(data.faqs);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối tới hệ thống AI');
    } finally {
      setLoading(false);
    }
  };

  const handlePipeline2Step = () => {
    if (!outlineResult || outlineResult.length === 0) return;
    const outlineContext = outlineResult
      .map((item) => `[H${item.level}] ${item.title}: ${item.description || ''} ${item.points ? item.points.join(', ') : ''}`)
      .join('\n');
    setActiveTab('full');
    handleRunAi('generate_full_article', `Hãy bám sát dàn ý chi tiết sau đây để viết bài viết hoàn chỉnh:\n${outlineContext}`);
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'heading':
        return <ListTree className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'singleImage':
      case 'imageGallery':
        return <ImageIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'specTable':
      case 'priceTable':
        return <Table className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'relatedCar':
        return <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'prosCons':
        return <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'callout':
        return <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'youtube':
      case 'tiktok':
        return <Video className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'faq':
        return <MessageSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
      case 'ctaButton':
      case 'leadForm':
        return <MousePointerClick className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[92vh] overflow-y-auto">
      <div className="space-y-5">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Trợ Lý AI Viết Bài & Tối Ưu SEO (Cyborg Content Engine)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tự động điều phối 14 Content Block tinh hoa (Hình ảnh, Video, Bảng thông số, Xe liên quan, Form báo giá, FAQ...)
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-white/5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'full'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            1. Viết Toàn Bộ Bài (A-Z)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'outline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            2. Tạo Dàn Ý (Pipeline 2-Bước)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('continue')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'continue'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            3. Viết Tiếp / Bổ Sung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'seo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            4. Tối Ưu SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'faq'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            5. Khối FAQ
          </button>
        </div>

        {/* Global Parameters Card */}
        <Card className="p-3.5 bg-slate-950/40 border-slate-800 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Dòng xe liên quan</label>
              <Input
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="VD: Hyundai Accent 2026"
                className="h-9 text-xs bg-slate-900 border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Khu vực / Tỉnh thành</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Nghệ An, Hà Tĩnh"
                className="h-9 text-xs bg-slate-900 border-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Từ khóa SEO chính (Focus Keyword)</label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="VD: Giá xe Accent tại Vinh"
                className="h-9 text-xs bg-slate-900 border-slate-700"
              />
            </div>
          </div>

          {availableCars && availableCars.length > 0 && (
            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Xe có sẵn trong kho đại lý:</span>
              {availableCars.slice(0, 6).map((c) => (
                <button
                  key={c.id || c.slug}
                  type="button"
                  onClick={() => setCarModel(c.tenXe)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                    carModel.toLowerCase().includes(c.tenXe.toLowerCase())
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {c.tenXe}
                </button>
              ))}
            </div>
          )}
        </Card>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Viết Toàn Bộ Bài Viết (Full Article) */}
        {activeTab === 'full' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Chủ đề hoặc Yêu cầu bài viết hoàn chỉnh
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Đánh giá chi tiết và giá lăn bánh Hyundai Tucson 2026 tại Nghệ An"
                className="h-10 text-sm bg-slate-950/80 border-slate-700"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="text-xs text-slate-400">
                AI tự động điều phối 14 Content Block tinh hoa & tự động ghép nối kho xe thật (Giá niêm yết, Ảnh, Bảng thông số...).
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('generate_full_article')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Đang viết bài viết từ A-Z...' : 'Tạo Toàn Bộ Bài Viết (A-Z)'}
              </Button>
            </div>

            {loading && (
              <Card className="p-6 bg-slate-950/80 border-cyan-500/30 rounded-xl space-y-3 text-center animate-pulse">
                <div className="flex items-center justify-center gap-3 text-cyan-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-bold">Trợ lý AI đang soạn thảo bài viết hoàn chỉnh...</span>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Hệ thống đang đối chiếu dữ liệu kỹ thuật, giá lăn bánh tại {location}, phân bổ hình ảnh, video và 14 Content Block tinh hoa. Quá trình mất khoảng 10-25 giây.
                </p>
              </Card>
            )}

            {fullArticleResult && (
              <Card className="p-4 bg-slate-950/70 border-cyan-500/40 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Bài viết hoàn chỉnh sẵn sàng ({fullArticleResult.blocks?.length || 0} khối nội dung)
                  </span>
                  {onInsertFullArticle && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        onInsertFullArticle(fullArticleResult);
                        onClose();
                      }}
                      className="h-8 px-3.5 text-xs font-bold flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3.5 h-3.5" /> Áp dụng vào Bài Viết & SEO (1-Click)
                    </Button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  {/* Title & Summary */}
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Tiêu đề bài viết:</span>
                    <p className="p-2.5 bg-slate-900 rounded-lg text-slate-100 font-bold border border-slate-800">
                      {fullArticleResult.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Đoạn tóm tắt (Excerpt):</span>
                    <p className="p-2.5 bg-slate-900/80 rounded-lg text-slate-200 leading-relaxed border border-slate-800">
                      {fullArticleResult.summary}
                    </p>
                  </div>

                  {/* SEO Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Meta Title ({fullArticleResult.metaTitle?.length || 0}/60 ký tự):</span>
                      <p className="p-2 bg-slate-900 rounded-lg text-cyan-300 font-medium border border-slate-800 text-[11px]">
                        {fullArticleResult.metaTitle}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Từ khóa chính (Focus):</span>
                      <p className="p-2 bg-slate-900 rounded-lg text-emerald-300 font-mono border border-slate-800 text-[11px]">
                        {fullArticleResult.focusKeyword}
                      </p>
                    </div>
                  </div>

                  {/* Block Structure Preview */}
                  <div>
                    <span className="text-slate-400 font-medium block mb-1.5">
                      Cấu trúc các khối nội dung sinh ra ({fullArticleResult.blocks?.length || 0} khối):
                    </span>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {fullArticleResult.blocks?.map((block, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-slate-900/60 rounded border border-slate-800/80 text-[11px] flex items-center gap-2"
                        >
                          {getBlockIcon(block.type)}
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] shrink-0 uppercase">
                            {block.type === 'heading' ? `H${block.level || 2}` : block.type}
                          </span>
                          <span className="text-slate-300 truncate flex-1">
                            {block.type === 'heading' && block.content}
                            {block.type === 'paragraph' && block.content}
                            {block.type === 'singleImage' && `Ảnh: ${block.imageAlt || block.caption || 'Hình ảnh minh họa'}`}
                            {block.type === 'imageGallery' && `Bộ sưu tập: ${block.title || 'Thư viện ảnh'}`}
                            {block.type === 'specTable' && `Bảng thông số: ${block.title || 'So sánh thông số'}`}
                            {block.type === 'priceTable' && `Bảng giá: ${block.title || 'Dự toán lăn bánh'}`}
                            {block.type === 'relatedCar' && `Gợi ý xe: ${block.carName || block.carSlug || 'Xe liên quan'}`}
                            {block.type === 'youtube' && `Video: ${block.title || 'Video YouTube'}`}
                            {block.type === 'tiktok' && `TikTok: ${block.title || 'Video TikTok'}`}
                            {block.type === 'prosCons' && `Ưu/Nhược điểm: ${block.title || `${block.pros?.length || 0} ưu điểm, ${block.cons?.length || 0} lưu ý`}`}
                            {block.type === 'callout' && `Ghi chú (${block.calloutType || 'info'}): ${block.title || block.content}`}
                            {block.type === 'leadForm' && `Form Báo Giá: ${block.formHeadline || 'Đăng ký tư vấn'}`}
                            {block.type === 'faq' && `Hỏi đáp FAQ: ${block.title || `${block.faqs?.length || 0} câu hỏi`}`}
                            {block.type === 'ctaButton' && `CTA: ${block.ctaButtonText || 'Kêu gọi hành động'}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom 1-Click Apply */}
                  {onInsertFullArticle && (
                    <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          onInsertFullArticle(fullArticleResult);
                          onClose();
                        }}
                        className="h-9 px-4 text-xs font-bold flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4" /> Áp dụng toàn bộ vào Bài Viết & SEO (1-Click)
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Tạo Dàn Ý & Pipeline 2-Bước */}
        {activeTab === 'outline' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Chủ đề hoặc Tiêu đề bài viết cần tạo dàn ý
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Đánh giá chi tiết và giá lăn bánh Hyundai Accent 2026 tại Nghệ An"
                className="h-10 text-sm bg-slate-950/80 border-slate-700"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                AI sẽ phân chia các thẻ H2, H3 chuẩn SEO và các luận điểm quan trọng kèm khối nội dung gợi ý.
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('generate_outline')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang tạo dàn ý...' : 'Tạo Dàn Ý Chuẩn SEO'}
              </Button>
            </div>

            {loading && (
              <Card className="p-5 bg-slate-950/80 border-cyan-500/30 rounded-xl space-y-2 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang lập dàn ý bài viết chuẩn E-E-A-T...
                </div>
              </Card>
            )}

            {outlineResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Dàn ý đề xuất ({outlineResult.length} mục)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onInsertOutline(outlineResult);
                        onClose();
                      }}
                      className="h-8 px-3 text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <ListPlus className="w-3.5 h-3.5" /> Chèn dàn ý vào bài
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handlePipeline2Step}
                      className="h-8 px-3.5 text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" /> Viết chi tiết theo Dàn ý này (2-Step Pipeline)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {outlineResult.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs ${
                        item.level === 2
                          ? 'bg-slate-900 border-cyan-500/20 text-slate-100 font-semibold pl-3'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 pl-6'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-cyan-400 mr-2 font-mono text-[10px]">
                            H{item.level}
                          </span>
                          {item.title}
                        </div>
                        {item.suggestedBlockType && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                            {item.suggestedBlockType}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 font-normal mt-1 ml-6">
                          ↳ {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 3: Viết Tiếp / Mở Rộng */}
        {activeTab === 'continue' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Yêu cầu viết tiếp hoặc chủ đề phần thân bài cần AI triển khai
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Viết tiếp phần đánh giá trải nghiệm động cơ Smartstream 1.5L và khả năng tiết kiệm nhiên liệu khi di chuyển thực tế tại TP. Vinh"
                className="w-full h-24 p-3 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                AI sẽ tổng hợp thông số kỹ thuật và văn phong chuyên gia ô tô uy tín.
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('continue_writing')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang sinh nội dung...' : 'Viết Tiếp Nội Dung'}
              </Button>
            </div>

            {textResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Nội dung AI sinh ra
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(textResult);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="h-8 px-2.5 text-xs text-slate-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Đã sao chép' : 'Sao chép'}
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => {
                        onAppendText(textResult);
                        onClose();
                      }}
                      className="h-8 px-3 text-xs flex items-center gap-1.5"
                    >
                      <ListPlus className="w-3.5 h-3.5" /> Thêm thành đoạn văn
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {textResult}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 4: Tối Ưu SEO & LSI */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Tiêu đề & Định hướng SEO
              </label>
              <Input
                value={prompt || currentTitle}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập tiêu đề hoặc chủ đề cần tối ưu SEO"
                className="h-10 text-sm bg-slate-950/80 border-slate-700"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Tự động viết Meta Title, Meta Description chuẩn kích thước Google & gợi ý từ khóa LSI.
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('optimize_seo')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang phân tích SEO...' : '1-Click Tối Ưu SEO'}
              </Button>
            </div>

            {seoResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Đề xuất SEO từ AI
                  </span>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      onApplySeo(seoResult);
                      onClose();
                    }}
                    className="h-8 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Áp dụng vào Cài Đặt SEO
                  </Button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Meta Title ({seoResult.metaTitle.length}/60 ký tự):</span>
                    <p className="p-2.5 bg-slate-900 rounded-lg text-slate-100 font-semibold border border-slate-800">
                      {seoResult.metaTitle}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Meta Description ({seoResult.metaDescription.length}/160 ký tự):</span>
                    <p className="p-2.5 bg-slate-900 rounded-lg text-slate-200 leading-relaxed border border-slate-800">
                      {seoResult.metaDescription}
                    </p>
                  </div>

                  {seoResult.suggestedKeywords && seoResult.suggestedKeywords.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-medium block mb-1.5">Từ khóa ngữ nghĩa LSI đề xuất:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {seoResult.suggestedKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-slate-900 rounded-md text-cyan-300 font-mono text-[11px] border border-cyan-500/20"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 5: Sinh Khối FAQ Chuẩn Schema */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Chủ đề cần sinh câu hỏi thường gặp
              </label>
              <Input
                value={prompt || currentTitle}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Thủ tục mua xe Hyundai Creta trả góp tại Nghệ An"
                className="h-10 text-sm bg-slate-950/80 border-slate-700"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Tạo 3-5 câu hỏi đáp YMYL thực tế (bấm biển, thủ tục vay vốn, bảo dưỡng xe).
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('generate_faqs')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang tạo FAQ...' : 'Sinh Khối FAQ Chuẩn SEO'}
              </Button>
            </div>

            {faqResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Danh sách câu hỏi FAQ ({faqResult.length} câu)
                  </span>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      onInsertFaqs(faqResult);
                      onClose();
                    }}
                    className="h-8 px-3 text-xs flex items-center gap-1.5"
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Chèn khối FAQ vào bài viết
                  </Button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {faqResult.map((faq, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-cyan-300">Q: {faq.question}</p>
                      <p className="text-slate-300 leading-relaxed text-[11px]">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
