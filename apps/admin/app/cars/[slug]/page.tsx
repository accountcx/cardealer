'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Info, Sparkles, Layers, Palette, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Card, Tabs, TabItem, Skeleton } from '@cardealer/ui';
import { TabGeneralInfo } from './components/TabGeneralInfo';
import { TabFeatures, HighlightFeatureItem } from './components/TabFeatures';
import { TabVersions, VersionItem } from './components/TabVersions';
import { TabColors, VersionColorConfig } from './components/TabColors';
import { catalogService } from '../../../services/catalog.service';
import { colorService } from '../../../services/color.service';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 🧠 Mental Model: Form Biên tập & Thêm Mới Dòng Xe (Tabbed Orchestrator Pattern).
// Đầy đủ 4 Tabs: Thông tin chung, Tính năng nổi bật, Phiên bản & giá, Bảng màu ngoại thất.
// Ghép nối trực tiếp API: POST /api/admin/cars khi tạo mới, PUT /api/admin/cars/:slug khi chỉnh sửa.

type TabType = 'info' | 'features' | 'versions' | 'colors';

export default function CarEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(slug !== 'new');
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form State: Tab 1
  const [tenXe, setTenXe] = useState(slug === 'new' ? '' : '');
  const [carSlug, setCarSlug] = useState(slug === 'new' ? '' : slug);
  const [anhDaiDienUrl, setAnhDaiDienUrl] = useState('');
  const [segment, setSegment] = useState('suv');
  const [traTruocTu, setTraTruocTu] = useState('');
  const [promotionSummary, setPromotionSummary] = useState('');
  const [moTaChung, setMoTaChung] = useState('');
  const [status, setStatus] = useState('published');
  const [isFeatured, setIsFeatured] = useState(false);

  const handleTenXeChange = (val: string) => {
    setTenXe(val);
    if (slug === 'new' && (!carSlug || carSlug === toSlug(tenXe))) {
      setCarSlug(toSlug(val));
    }
  };

  // Form State: Tab 2
  const [features, setFeatures] = useState<HighlightFeatureItem[]>([
    { icon: 'engine', title: 'ĐỘNG CƠ', value: 'Smartstream G2.0 / 1.6 Turbo' },
    { icon: 'transmission', title: 'HỘP SỐ', value: '6 AT / 7 DCT Tự Động' },
    { icon: 'power', title: 'CÔNG SUẤT', value: '180 Mã Lực Cực Đại' },
    { icon: 'seat', title: 'CHỖ NGỒI', value: '5 Chỗ Rộng Nhất Phân Khúc' },
    { icon: 'fuel', title: 'NHIÊN LIỆU', value: 'Tiết Kiệm 6.3L/100km' },
    { icon: 'safety', title: 'AN TOÀN', value: 'Hyundai SmartSense Thế Hệ Mới' },
  ]);

  // Form State: Tab 3
  const [versions, setVersions] = useState<VersionItem[]>([]);

  // Form State: Tab 4
  const [colorConfigs, setColorConfigs] = useState<VersionColorConfig[]>([]);

  useEffect(() => {
    async function fetchCarDetails() {
      if (!slug || slug === 'new') {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setPageError(null);
        const carData = await catalogService.getCarBySlug<any>(slug);
        if (carData) {
          if (carData.tenXe) setTenXe(carData.tenXe);
          if (carData.slug) setCarSlug(carData.slug);
          if (carData.anhDaiDienUrl) setAnhDaiDienUrl(carData.anhDaiDienUrl);
          if (carData.segment) setSegment(carData.segment);
          if (carData.traTruocTu) setTraTruocTu(String(carData.traTruocTu));
          if (carData.promotionSummary) setPromotionSummary(carData.promotionSummary);
          if (carData.moTaChung) setMoTaChung(carData.moTaChung);
          if (carData.status) setStatus(carData.status);
          if (typeof carData.isFeatured === 'boolean') setIsFeatured(carData.isFeatured);

          if (Array.isArray(carData.versions)) {
            setVersions(carData.versions);
            const loadedConfigs: VersionColorConfig[] = [];
            carData.versions.forEach((ver: any) => {
              if (Array.isArray(ver.versionColors)) {
                ver.versionColors.forEach((vc: any) => {
                  loadedConfigs.push({
                    versionId: ver.id,
                    colorId: vc.colorId || vc.color?.id,
                    tenMau: vc.color?.tenMau || '',
                    hexCode: vc.color?.hexCode || '',
                    isTwoTone: Boolean(vc.color?.isTwoTone),
                    secondaryHexCode: vc.color?.secondaryHexCode,
                    selected: true,
                    isDefault: Boolean(vc.isDefault),
                    anhXeTheoMauUrl: vc.anhXeTheoMauUrl || '',
                  });
                });
              }
            });
            setColorConfigs(loadedConfigs);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Không thể tải thông tin dòng xe "${slug}" từ máy chủ`;
        setPageError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchCarDetails();
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = tenXe.trim();
    if (!trimmedName) {
      setSaveError('Vui lòng nhập tên dòng xe');
      setActiveTab('info');
      return;
    }

    const computedSlug = (carSlug || toSlug(trimmedName)).trim();
    if (!computedSlug) {
      setSaveError('Vui lòng nhập đường dẫn URL (slug) hợp lệ');
      setActiveTab('info');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      tenXe: trimmedName,
      slug: computedSlug,
      anhDaiDienUrl: anhDaiDienUrl.trim() || `/images/cars/${computedSlug}.webp`,
      segment,
      traTruocTu: traTruocTu ? Number(traTruocTu) : null,
      promotionSummary: promotionSummary.trim() || null,
      moTaChung: moTaChung.trim() || null,
      status,
      isFeatured,
      highlightFeatures: features,
      versions: versions.map((v, idx) => ({
        id: v.id,
        tenPhienBan: v.tenPhienBan,
        slug: v.slug || toSlug(v.tenPhienBan),
        giaNiemYet: Number(v.giaNiemYet || 0),
        giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
        seatCount: Number(v.seatCount || 5),
        dongCo: v.dongCo || null,
        hopSo: v.hopSo || null,
        danDong: v.danDong || null,
        sortOrder: idx + 1,
      })),
    };

    try {
      if (slug === 'new') {
        await catalogService.createCar(payload);
      } else {
        await catalogService.updateCar(slug, payload);
      }

      // Lưu cấu hình màu cho các phiên bản nếu có
      const selectedColors = colorConfigs.filter((c) => c.selected);
      if (computedSlug && selectedColors.length > 0) {
        await colorService.saveVersionColors(
          computedSlug,
          selectedColors.map((c) => ({
            versionId: c.versionId,
            colorId: c.colorId,
            anhXeTheoMauUrl: c.anhXeTheoMauUrl,
            isDefault: c.isDefault,
          }))
        );
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      if (slug === 'new') {
        setTimeout(() => {
          router.push('/cars');
        }, 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu dữ liệu lên máy chủ';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const tabItems: TabItem[] = [
    { id: 'info', label: '1. Thông Tin Chung', icon: <Info size={16} /> },
    { id: 'features', label: '2. 6 Tính Năng Nổi Bật', icon: <Sparkles size={16} /> },
    { id: 'versions', label: '3. Phiên Bản & Giá', icon: <Layers size={16} />, badge: versions.length },
    { id: 'colors', label: '4. Bảng Màu Ngoại Thất', icon: <Palette size={16} />, badge: colorConfigs.filter((c) => c.selected).length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Link
            href="/cars"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {slug === 'new' ? 'Thêm Dòng Xe Mới' : tenXe || slug}
            </h1>
            <div className="text-xs text-slate-400 font-mono">/{carSlug || 'slug-xe'}</div>
          </div>
        </div>

        <Button
          variant={saved ? 'success' : 'accent'}
          glow={!saved}
          onClick={handleSave}
          isLoading={saving}
          leftIcon={saved ? <Check size={16} /> : <Save size={16} />}
        >
          {saved ? 'Đã Lưu Thay Đổi!' : 'Lưu Thay Đổi'}
        </Button>
      </div>

      {/* Page / Save Error Notifications */}
      {saveError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2.5 text-sm shadow-lg">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span><strong className="font-bold text-red-200">Lỗi lưu dữ liệu:</strong> {saveError}</span>
        </div>
      )}

      {pageError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2.5 text-sm shadow-lg">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span><strong className="font-bold text-red-200">Lỗi tải dữ liệu:</strong> {pageError}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs
        items={tabItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabType)}
      />

      {/* Tab Panels */}
      <Card variant="default" className="p-6 md:p-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Field 1: Tên Dòng Xe */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 2: Slug */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 3: Phân khúc xe */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 4: Trả trước từ */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 5: Tóm tắt khuyến mãi */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 6: Ảnh đại diện URL */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Field 7: Mô tả chung (textarea span 2) */}
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>

              {/* Field 8 & 9: Trạng thái & Xe Hot */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'info' && (
              <TabGeneralInfo
                tenXe={tenXe}
                setTenXe={handleTenXeChange}
                carSlug={carSlug}
                setCarSlug={setCarSlug}
                anhDaiDienUrl={anhDaiDienUrl}
                setAnhDaiDienUrl={setAnhDaiDienUrl}
                segment={segment}
                setSegment={setSegment}
                traTruocTu={traTruocTu}
                setTraTruocTu={setTraTruocTu}
                promotionSummary={promotionSummary}
                setPromotionSummary={setPromotionSummary}
                moTaChung={moTaChung}
                setMoTaChung={setMoTaChung}
                status={status}
                setStatus={setStatus}
                isFeatured={isFeatured}
                setIsFeatured={setIsFeatured}
              />
            )}
            {activeTab === 'features' && <TabFeatures features={features} setFeatures={setFeatures} />}
            {activeTab === 'versions' && <TabVersions versions={versions} setVersions={setVersions} />}
            {activeTab === 'colors' && (
              <TabColors
                versions={versions}
                colorConfigs={colorConfigs}
                setColorConfigs={setColorConfigs}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
