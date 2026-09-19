import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '@cardealer/ui';

// 🧠 Mental Model: Tab 3 - Danh sách Phiên bản & Giá bán niêm yết/khuyến mãi.
// Mỗi dòng xe có thể có 2-4 phiên bản trang bị khác nhau (Động cơ, Hộp số, Dẫn động).
// Sử dụng Button, Card, Input từ @cardealer/ui (Invariant 11).

export interface VersionItem {
  id: string;
  tenPhienBan: string;
  slug: string;
  giaNiemYet: number;
  giaKhuyenMai?: number;
  seatCount?: number;
  dongCo?: string;
  hopSo?: string;
  danDong?: string;
}

interface TabVersionsProps {
  versions: VersionItem[];
  setVersions: React.Dispatch<React.SetStateAction<VersionItem[]>>;
}

export function TabVersions({ versions, setVersions }: TabVersionsProps) {
  const handleAddVersion = () => {
    const newVer: VersionItem = {
      id: `v_${Date.now()}`,
      tenPhienBan: 'Phiên Bản Mới',
      slug: `phien-ban-${Date.now()}`,
      giaNiemYet: 700_000_000,
      dongCo: '2.0L',
      hopSo: '6 AT',
      danDong: 'FWD',
    };
    setVersions((prev) => [...prev, newVer]);
  };

  const handleRemoveVersion = (id: string) => {
    if (versions.length <= 1) {
      alert('Dòng xe phải có ít nhất 1 phiên bản!');
      return;
    }
    setVersions((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVersion = (index: number, field: keyof VersionItem, val: string | number) => {
    setVersions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Các Phiên Bản Trang Bị & Giá Bán
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình giá niêm yết, giá khuyến mãi và thông số động cơ cho từng phiên bản
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVersion}
          leftIcon={<Plus size={14} />}
        >
          Thêm Phiên Bản
        </Button>
      </div>

      <div className="space-y-4">
        {versions.map((ver, idx) => (
          <Card
            key={ver.id}
            variant="default"
            className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end bg-slate-900/60 border-slate-700/60"
          >
            <div>
              <Input
                label="Tên Phiên Bản *"
                value={ver.tenPhienBan}
                onChange={(e) => updateVersion(idx, 'tenPhienBan', e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Giá Niêm Yết (VNĐ) *"
                type="number"
                value={ver.giaNiemYet}
                onChange={(e) => updateVersion(idx, 'giaNiemYet', Number(e.target.value))}
              />
            </div>

            <div>
              <Input
                label="Giá Khuyến Mãi (VNĐ)"
                type="number"
                placeholder="Để trống nếu không có"
                value={ver.giaKhuyenMai || ''}
                onChange={(e) => updateVersion(idx, 'giaKhuyenMai', Number(e.target.value))}
              />
            </div>

            <div>
              <Input
                label="Động Cơ"
                value={ver.dongCo || ''}
                onChange={(e) => updateVersion(idx, 'dongCo', e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={() => handleRemoveVersion(ver.id)}
                aria-label="Xóa phiên bản"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
