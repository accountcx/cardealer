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
  AlertCircle,
  Key,
  Layers,
  ArrowRight,
  ListPlus,
  RefreshCw,
} from 'lucide-react';
import { Modal, Button, Card, Input } from '@cardealer/ui';
import { aiService } from '../../../../services/ai.service';
import type {
  AiAction,
  OutlineItem,
  FaqItem,
  SeoOptimizationResult,
} from '@cardealer/types';

export interface AiWritingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentKeyword: string;
  currentBlocksText: string;
  onInsertOutline: (outline: OutlineItem[]) => void;
  onInsertFaqs: (faqs: FaqItem[]) => void;
  onAppendText: (text: string) => void;
  onApplySeo: (seo: SeoOptimizationResult) => void;
}

type AiTab = 'outline' | 'continue' | 'seo' | 'faq';

// 🧠 Mental Model: Trợ Lý AI Viết Bài & Tối Ưu SEO Toàn Diện (Cyborg Content Engine).
// Tận dụng sức mạnh ChatGPT / OpenAI Model để hỗ trợ biên tập viên:
// 1. Tạo dàn ý chuẩn H2/H3 cho bài đánh giá/bảng giá xe
// 2. Viết tiếp đoạn văn thông số kỹ thuật & trải nghiệm
// 3. Tối ưu SEO On-page: sinh Meta Title, Meta Description, từ khóa LSI
// 4. Sinh khối FAQ chuẩn Schema FAQPage cho Local SEO & YMYL
export function AiWritingAssistantModal({
  isOpen,
  onClose,
  currentTitle,
  currentKeyword,
  currentBlocksText,
  onInsertOutline,
  onInsertFaqs,
  onAppendText,
  onApplySeo,
}: AiWritingAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<AiTab>('outline');

  // Input states
  const [prompt, setPrompt] = useState('');
  const [carModel, setCarModel] = useState('');
  const [location, setLocation] = useState('Nghệ An');
  const [keyword, setKeyword] = useState('');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Result states
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
      // Heuristic car model extraction from title
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

  const handleRunAi = async (action: AiAction) => {
    setLoading(true);
    setErrorMsg(null);
    setCopied(false);

    try {
      const data = await aiService.generate({
        action,
        prompt: prompt || currentTitle || 'Bài viết tư vấn mua xe ô tô Hyundai chính hãng',
        context: currentBlocksText || undefined,
        keyword: keyword || currentKeyword || undefined,
        carModel: carModel || undefined,
        location: location || undefined,
      });

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Trợ Lý AI Viết Bài & Tối Ưu SEO (ChatGPT)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chiến lược Cyborg Content (Người lai Máy): Tự động hóa dàn ý, thông số và FAQ chuẩn SEO
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'outline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ListTree className="w-4 h-4" />
            1. Tạo Dàn Ý (Outline)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('continue')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'continue'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Viết Tiếp / Bổ Sung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'seo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search className="w-4 h-4" />
            3. Tối Ưu SEO & LSI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'faq'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            4. Khối FAQ Tự Động
          </button>
        </div>

        {/* Global Parameters Card */}
        <Card className="p-4 bg-slate-950/40 border-slate-800 rounded-xl space-y-3">
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
              <label className="text-xs font-medium text-slate-300 mb-1 block">Từ khóa SEO chính</label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="VD: Giá xe Accent tại Vinh"
                className="h-9 text-xs bg-slate-900 border-slate-700"
              />
            </div>
          </div>
        </Card>

        {/* Tab 1: Tạo Dàn Ý */}
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
                AI sẽ phân chia các thẻ H2, H3 chuẩn SEO và các luận điểm quan trọng.
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

            {outlineResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Dàn ý đề xuất ({outlineResult.length} mục)
                  </span>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      onInsertOutline(outlineResult);
                      onClose();
                    }}
                    className="h-8 px-3 text-xs flex items-center gap-1.5"
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Chèn thẳng vào bài viết
                  </Button>
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
                      <span className="text-cyan-400 mr-2 font-mono text-[10px]">
                        H{item.level}
                      </span>
                      {item.title}
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

        {/* Tab 2: Viết Tiếp / Mở Rộng */}
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

        {/* Tab 3: Tối Ưu SEO & LSI */}
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
                      <span className="text-slate-400 font-medium block mb-1.5">Từ khóa liên quan (LSI Keywords):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {seoResult.suggestedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-md text-[11px]"
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

        {/* Tab 4: FAQ Schema */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-200 mb-1.5 block">
                Chủ đề cần tạo bộ câu hỏi thường gặp (FAQ)
              </label>
              <Input
                value={prompt || currentTitle}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Mua trả góp xe Accent tại Nghệ An, thủ tục bấm biển..."
                className="h-10 text-sm bg-slate-950/80 border-slate-700"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Tự động sinh 3-5 câu hỏi thường gặp kết nối với Schema FAQPage giúp tăng hiển thị Google Rich Results.
              </p>
              <Button
                variant="accent"
                onClick={() => handleRunAi('generate_faqs')}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Đang tạo FAQ...' : 'Sinh Khối FAQ Tự Động'}
              </Button>
            </div>

            {faqResult && (
              <Card className="p-4 bg-slate-950/60 border-cyan-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Bộ câu hỏi FAQ ({faqResult.length} câu)
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
                    <ListPlus className="w-3.5 h-3.5" /> Chèn Khối FAQ vào bài viết
                  </Button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {faqResult.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                      <p className="font-semibold text-cyan-300">Q: {faq.question}</p>
                      <p className="text-slate-300 leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold">Không thể hoàn thành yêu cầu AI</p>
              <p className="text-rose-400/90 mt-0.5">{errorMsg}</p>
              {errorMsg.includes('API Key') && (
                <a
                  href="/settings"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-cyan-400 underline hover:text-cyan-300 mt-1.5 font-medium"
                >
                  <Key className="w-3 h-3" /> Đi tới trang Cài Đặt Hệ Thống để nhập OpenAI API Key
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer Advice */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Khuyên dùng: Kết hợp 70% nội dung sườn AI + 30% kinh nghiệm thực tế tại địa phương.</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs text-slate-400">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
