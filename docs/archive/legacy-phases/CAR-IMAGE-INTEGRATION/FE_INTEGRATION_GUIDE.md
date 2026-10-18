# 🎨 FRONTEND INTEGRATION GUIDE: GIAO DIỆN CHỌN & TẢI ẢNH CHO QUẢN TRỊ XE

> **Tuân thủ:** `universal-agentic-workflow.xml` - **Phase 2.5: UI Integration Spec**  
> **Role / Active Skills:** `tailwind-ui-designer`  
> **Tài liệu tham chiếu:** [`FLOW.md`](./FLOW.md), [`SOLUTION_OPTIONS.md`](./SOLUTION_OPTIONS.md)

---

## 1. Design Tokens & Component Matrix

| Thành Phần UI | Component Sử Dụng | Token / CSS Classes | Mục Đích |
| :--- | :--- | :--- | :--- |
| **Nút Mở Picker** | `Button` (`@cardealer/ui`) | `variant="outline" size="sm"` `h-7 text-xs border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400` | Nút "Chọn Từ Thư Viện" nhỏ gọn trên header ô nhập |
| **Ô Nhập URL** | `Input` (`@cardealer/ui`) | `font-mono text-xs bg-slate-900/80 border-slate-700/60` | Hiển thị URL ảnh sắc nét, có thể đọc và copy |
| **Nút Xóa Nhanh** | `Button` (`@cardealer/ui`) | `variant="ghost" size="icon"` `hover:text-rose-400 hover:bg-rose-500/10` | Nút `X` để làm trống trường ảnh tức thì |
| **Khung Thumbnail Preview** | Thẻ `div` + `img` | `rounded-xl border border-slate-700/60 bg-slate-950/60 overflow-hidden` | Khung xem trước ảnh xe theo màu hoặc ảnh đại diện |
| **Hộp Thoại Chọn/Tải Ảnh** | `MediaPickerModal` | Dùng chung từ `apps/admin/app/components/MediaPickerModal` | Modal 2 tab (Thư viện + Upload), `mode="single"` |

---

## 2. Đặc Tả Giao Diện Từng Màn Hình

### 🔹 1. `TabGeneralInfo.tsx` (Chỉnh sửa thông tin chung dòng xe)

```tsx
<div className="md:col-span-2 space-y-2">
  <div className="flex items-center justify-between">
    <label className="block text-xs font-semibold text-slate-300">
      Ảnh Đại Diện Xe (URL)
    </label>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setIsMediaPickerOpen(true)}
      className="h-7 text-xs flex items-center gap-1.5 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300"
    >
      <ImageIcon size={13} />
      <span>Chọn Từ Thư Viện / Tải Mới</span>
    </Button>
  </div>

  <div className="flex items-center gap-2">
    <Input
      placeholder="Ví dụ: /images/cars/tucson.webp hoặc chọn từ Thư Viện Ảnh"
      value={anhDaiDienUrl}
      onChange={(e) => setAnhDaiDienUrl(e.target.value)}
      className="font-mono text-xs"
    />
    {anhDaiDienUrl && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setAnhDaiDienUrl('')}
        className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
        aria-label="Xóa ảnh"
      >
        <X size={16} />
      </Button>
    )}
  </div>

  {/* Thumbnail Preview */}
  {anhDaiDienUrl && (
    <div className="relative aspect-16/9 max-w-sm rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden p-2 flex items-center justify-center">
      <img
        src={anhDaiDienUrl}
        alt="Ảnh đại diện xe"
        className="h-full w-full object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  )}
</div>
```

---

### 🔹 2. `TabColors.tsx` (Cấu hình màu sắc xe & mâm)

```tsx
<div className="pt-3 border-t border-white/10 space-y-3">
  {/* Checkbox màu mặc định */}
  ...

  {/* Trường URL & Picker */}
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-300">
        Đường Dẫn Ảnh Xe Thật Theo Màu & Mâm Bản Này
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setColorPickerTarget({
            versionId: activeVersionId,
            colorId: color.id,
            colorName: color.name,
            currentUrl: config?.anhXeTheoMauUrl || '',
          })
        }
        className="h-6 px-2 text-[11px] flex items-center gap-1 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300"
      >
        <ImageIcon size={12} />
        <span>Chọn / Tải Ảnh</span>
      </Button>
    </div>

    <div className="flex items-center gap-2">
      <Input
        placeholder="Chọn ảnh từ Thư Viện hoặc dán URL..."
        value={config?.anhXeTheoMauUrl || ''}
        onChange={(e) => updateColorImage(activeVersionId, color.id, e.target.value)}
        className="font-mono text-xs"
      />
      {config?.anhXeTheoMauUrl && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => updateColorImage(activeVersionId, color.id, '')}
          className="h-9 w-9 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
          aria-label="Xóa ảnh màu xe"
        >
          <X size={15} />
        </Button>
      )}
    </div>

    {/* Thumbnail Preview cho màu xe */}
    {config?.anhXeTheoMauUrl && (
      <div className="relative aspect-16/9 w-full rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden p-1.5 flex items-center justify-center">
        <img
          src={config.anhXeTheoMauUrl}
          alt={`Xe màu ${color.name}`}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    )}
  </div>
</div>
```
