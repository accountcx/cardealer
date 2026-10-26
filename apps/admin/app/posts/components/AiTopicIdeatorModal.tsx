'use client';

// 🧠 Mental Model: Modal Trợ Lý AI Gợi Ý Ý Tưởng Bài Viết Chống Trùng Lặp (US-05).
// 1. Phân tích đối soát toàn diện kho bài viết trong database để phát hiện Content Gaps.
// 2. Cho phép lọc theo Dòng xe, Chuyên mục, Góc nhìn tiếp cận độc bản.
// 3. Hiển thị danh sách Idea Cards trực quan kèm Khoảng trống nội dung & Từ khóa chính.
// 4. Hỗ trợ 1-Click chuyển tiếp sang trang tạo bài mới hoặc điền thẳng vào form biên tập.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  Car,
  Layers,
  Compass,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal, Button, Input, Select, Badge } from '@cardealer/ui';
import type { TopicIdeaItem } from '@cardealer/types';
import type { CarSummary } from '../../../services/catalog.service';
import type { CategoryItem } from '../../../services/post.service';
import { aiService } from '../../../services/ai.service';

export interface AiTopicIdeatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCars?: CarSummary[];
  categories?: CategoryItem[];
  onSelectIdea?: (idea: TopicIdeaItem) => void;
}

const PRESET_ANGLES = [
  'Tất cả các góc nhìn mới',
  'Chi phí lăn bánh & Nuôi xe 5 năm thực tế',
  'So sánh đối đầu trực diện đối thủ phân khúc',
  'Tình huống sử dụng thực tế (Mùa mưa, đèo dốc)',
  'Tư vấn tài chính & Phương án vay trả góp tối ưu',
  'Trải nghiệm gia đình 3 thế hệ & Chuyến đi xa',
  'Kinh nghiệm bảo dưỡng & Mẹo tiết kiệm nhiên liệu',
];

export function AiTopicIdeatorModal({
  isOpen,
  onClose,
  availableCars = [],
  categories = [],
  onSelectIdea,
}: AiTopicIdeatorModalProps) {
  const router = useRouter();

  // Form State
  const [selectedCarModel, setSelectedCarModel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAngle, setSelectedAngle] = useState<string>(PRESET_ANGLES[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [ideasCount, setIdeasCount] = useState<number>(4);

  // Runtime State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<TopicIdeaItem[]>([]);
  const [dedupCount, setDedupCount] = useState<number | null>(null);
  const [expandedOutlines, setExpandedOutlines] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleOutline = (idx: number) => {
    setExpandedOutlines((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyTitle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetCarObj = availableCars.find((c) => c.slug === selectedCarModel || c.tenXe === selectedCarModel);
      const targetCarName = selectedCarModel === 'all' ? undefined : (targetCarObj ? targetCarObj.tenXe : selectedCarModel);

      const targetCatObj = categories.find((c) => c.id === selectedCategory || c.tenChuyenMuc === selectedCategory);
      const targetCatName = selectedCategory === 'all' ? undefined : (targetCatObj ? targetCatObj.tenChuyenMuc : selectedCategory);

      const res = await aiService.generate({
        action: 'generate_topic_ideas',
        prompt: customPrompt.trim() || 'Gợi ý các chủ đề bài viết mới lạ, chuẩn SEO, giải quyết khoảng trống nội dung',
        carModel: targetCarName,
        carSlug: targetCarObj?.slug,
        category: targetCatName,
        angle: selectedAngle === PRESET_ANGLES[0] ? undefined : selectedAngle,
        ideasCount,
        availableCars: availableCars.map((c) => ({
          tenXe: c.tenXe,
          slug: c.slug,
          minPrice: c.minPrice,
        })),
      });

      if (res.topicIdeas && res.topicIdeas.length > 0) {
        setIdeas(res.topicIdeas);
        setDedupCount(res.deduplicationCount || null);
      } else {
        setError('Không nhận được ý tưởng nào từ trợ lý AI. Vui lòng thử lại với các tiêu chí khác.');
      }
    } catch (err: unknown) {
      console.error('[AiTopicIdeatorModal] Lỗi sinh ý tưởng:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối khi gọi trợ lý AI. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyIdea = (idea: TopicIdeaItem) => {
    if (onSelectIdea) {
      onSelectIdea(idea);
      onClose();
      return;
    }

    // Nếu không có callback (ở trang danh sách /posts), điều hướng sang /posts/new với query parameters
    const params = new URLSearchParams();
    params.set('title', idea.title);
    params.set('keyword', idea.focusKeyword);
    params.set('slug', idea.slug);
    params.set('summary', idea.summary);
    if (idea.targetCar) params.set('car', idea.targetCar);
    if (idea.suggestedCategory) params.set('category', idea.suggestedCategory);

    onClose();
    router.push(`/posts/new?${params.toString()}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-white">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Trợ Lý AI Gợi Ý Ý Tưởng Bài Viết (Anti-Duplication)</h3>
            <p className="text-xs text-slate-400 font-normal">
              Tự động phân tích kho bài viết để phát hiện Content Gaps, loại bỏ 100% nguy cơ trùng lặp từ khóa.
            </p>
          </div>
        </div>
      }
      className="max-w-4xl bg-slate-900 border-white/10"
    >
      <div className="space-y-5 pt-1">
        {/* Anti-Duplication Badge Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
            <span>
              {dedupCount !== null
                ? `Đã đối soát với ${dedupCount} bài viết trong cơ sở dữ liệu — Đảm bảo 0% trùng lặp từ khóa & tiêu đề.`
                : 'Cơ chế Two-Tier Deduplication: Tự động đối soát toàn bộ kho bài viết để tránh ăn thịt từ khóa (Keyword Cannibalization).'}
            </span>
          </div>
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px] hidden sm:inline-flex">
            0% Duplicate Guarantee
          </Badge>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Chọn Dòng xe */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Car size={13} className="text-amber-400" /> Dòng xe mục tiêu
            </label>
            <select
              value={selectedCarModel}
              onChange={(e) => setSelectedCarModel(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-xs focus:outline-hidden focus:border-amber-500/50"
            >
              <option value="all">Tất cả dòng xe (Đa dạng hóa)</option>
              {availableCars.map((car) => (
                <option key={car.id} value={car.slug}>
                  {car.tenXe}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn Chuyên mục */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-400" /> Chuyên mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-xs focus:outline-hidden focus:border-cyan-500/50"
            >
              <option value="all">Tất cả chuyên mục (Tự động)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.tenChuyenMuc}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Chọn Góc nhìn */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass size={13} className="text-emerald-400" /> Định hướng góc nhìn
            </label>
            <select
              value={selectedAngle}
              onChange={(e) => setSelectedAngle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500/50"
            >
              {PRESET_ANGLES.map((angle) => (
                <option key={angle} value={angle}>
                  {angle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Input & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Yêu cầu bổ sung (VD: Tập trung cho người trẻ mua xe chạy Tết, xe lướt, địa hình dốc...)"
            className="bg-slate-800 border-white/10 text-slate-200 text-xs h-10 flex-1"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={ideasCount}
              onChange={(e) => setIdeasCount(Number(e.target.value))}
              className="h-10 px-2.5 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-xs"
              title="Số lượng ý tưởng cần sinh"
            >
              <option value={3}>3 ý tưởng</option>
              <option value={4}>4 ý tưởng</option>
              <option value={5}>5 ý tưởng</option>
            </select>

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="h-10 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-slate-950" />
                  <span>Đang phân tích kho bài...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-slate-950" />
                  <span>{ideas.length > 0 ? 'Sinh Thêm Ý Tưởng Mới' : 'Tìm Ý Tưởng Độc Bản'}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-[11px] opacity-80 mt-0.5">Vui lòng kiểm tra lại kết nối mạng hoặc thử đổi tiêu chí tìm kiếm.</p>
            </div>
          </div>
        )}

        {/* Loading Shimmer State */}
        {loading && (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-white/5 bg-slate-800/40 space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 bg-slate-700 rounded-md" />
                  <div className="h-5 w-32 bg-slate-700 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-slate-700 rounded-md" />
                <div className="h-4 w-full bg-slate-700/60 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State (Before Generation) */}
        {!loading && ideas.length === 0 && !error && (
          <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Chưa có ý tưởng bài viết nào</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Chọn dòng xe, chuyên mục và góc nhìn mong muốn rồi bấm &quot;Tìm Ý Tưởng Độc Bản&quot;. AI sẽ quét kho bài viết hiện có và tìm ra các khoảng trống nội dung tiềm năng nhất.
              </p>
            </div>
          </div>
        )}

        {/* Results List: Idea Cards */}
        {!loading && ideas.length > 0 && (
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Đã tìm thấy <strong className="text-amber-400">{ideas.length}</strong> ý tưởng độc bản không trùng lặp:</span>
              <span className="text-[11px] text-slate-400">Bấm &quot;Viết bài này&quot; để tự động nạp vào Editor</span>
            </div>

            {ideas.map((idea, idx) => {
              const isExpanded = Boolean(expandedOutlines[idx]);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-white/10 bg-slate-800/50 hover:bg-slate-800/80 transition-all space-y-3 group hover:border-amber-500/30"
                >
                  {/* Card Header: Badges & Angles */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px] font-semibold">
                        {idea.angle}
                      </Badge>
                      {idea.targetCar && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[11px]">
                          {idea.targetCar}
                        </Badge>
                      )}
                      {idea.suggestedCategory && (
                        <Badge variant="outline" className="bg-slate-700/60 text-slate-300 border-white/10 text-[11px]">
                          {idea.suggestedCategory}
                        </Badge>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      Intent: {idea.searchIntent || 'commercial'}
                    </span>
                  </div>

                  {/* Title & Focus Keyword */}
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {idea.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="text-slate-400">Từ khóa SEO:</span>
                      <code className="text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                        {idea.focusKeyword}
                      </code>
                    </div>
                  </div>

                  {/* Content Gap Box */}
                  <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">💡 Khoảng trống nội dung:</span>
                    <span>{idea.contentGap}</span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed">{idea.summary}</p>

                  {/* Collapsible Outline Preview */}
                  {idea.outlinePreview && idea.outlinePreview.length > 0 && (
                    <div className="pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => toggleOutline(idx)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        <span>{isExpanded ? 'Thu gọn dàn ý' : `Xem dàn ý gợi ý (${idea.outlinePreview.length} mục)`}</span>
                      </button>

                      {isExpanded && (
                        <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                          {idea.outlinePreview.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleCopyTitle(`${idea.title} | Từ khóa: ${idea.focusKeyword}`, idx)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy tiêu đề và từ khóa"
                    >
                      {copiedIndex === idx ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedIndex === idx ? 'Đã sao chép' : 'Sao chép ý tưởng'}</span>
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApplyIdea(idea)}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 h-8 px-3.5 shadow-md shadow-sky-500/20 cursor-pointer"
                    >
                      <span>Viết bài theo ý tưởng này</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 text-slate-300 hover:bg-slate-800 text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
