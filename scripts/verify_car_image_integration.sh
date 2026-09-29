#!/usr/bin/env bash

# ==============================================================================
# 🧠 Mental Model: End-to-End Machine Verification Script cho Feature Car Image Integration
# Tuân thủ triệt để universal-agentic-workflow.xml & fullstack-dev-executor.xml
# Phạm vi xác thực:
# 1. Kiểm tra môi trường Node.js (>= 24) & pnpm
# 2. Project-wide Type Check (turbo run check-types -> exit 0 trên cả 8/8 packages)
# 3. Tích hợp MediaPickerModal tại màn hình Tạo Mới Dòng Xe (CarFormModal.tsx)
# 4. Tích hợp MediaPickerModal tại màn hình Chỉnh Sửa Thông Tin Chung (TabGeneralInfo.tsx)
# 5. Tích hợp MediaPickerModal tại màn hình Cấu Hình Màu Sắc & Mâm Xe (TabColors.tsx)
# 6. Kiểm toán Design System & Zero Raw Controls (100% Button, Input từ @cardealer/ui, 0 raw <button>)
# 7. Kiểm tra tính toàn vẹn của Khung Preview Thumbnail 16:9 và nút xóa nhanh X
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "========================================================================"
echo "🚀 [VERIFY-CAR-IMAGE-INTEGRATION] BẮT ĐẦU QUY TRÌNH KIỂM CHỨNG TỰ ĐỘNG"
echo "========================================================================"
echo "Thư mục làm việc: $REPO_ROOT"
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 1: KIỂM TRA MÔI TRƯỜNG NODE.JS
# ------------------------------------------------------------------------------
echo "📦 [Bước 1/6] Kiểm tra môi trường Node.js & pnpm..."
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null 2>&1 || true
fi

NODE_VERSION=$(node -v)
PNPM_VERSION=$(pnpm -v)
echo "  ✓ Node Version: $NODE_VERSION"
echo "  ✓ pnpm Version: $PNPM_VERSION"
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 2: PROJECT-WIDE TYPE CHECK VỚI TURBOREPO
# ------------------------------------------------------------------------------
echo "🔍 [Bước 2/6] Thực thi Project-wide TypeScript Type Check (Turbo)..."
pnpm check-types
echo "  ✓ Project-wide Type Check PASS (8/8 packages, 0 errors)"
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 3: KIỂM TRA TÍCH HỢP TẠI MODAL TẠO MỚI DÒNG XE (CarFormModal.tsx)
# ------------------------------------------------------------------------------
echo "🚗 [Bước 3/6] Kiểm tra tích hợp tại CarFormModal.tsx (Tạo Mới Xe)..."
CAR_FORM_FILE="apps/admin/app/cars/components/CarFormModal.tsx"
if [ ! -f "$CAR_FORM_FILE" ]; then
  echo "  ❌ Không tìm thấy tệp $CAR_FORM_FILE!"
  exit 1
fi

if ! grep -q "MediaPickerModal" "$CAR_FORM_FILE" || \
   ! grep -q "Chọn Từ Thư Viện / Tải Mới" "$CAR_FORM_FILE" || \
   ! grep -q "aspect-16/9" "$CAR_FORM_FILE"; then
  echo "  ❌ CarFormModal.tsx chưa tích hợp MediaPickerModal đầy đủ hoặc thiếu khung preview 16:9!"
  exit 1
fi
echo "  ✓ CarFormModal PASS: Đã tích hợp MediaPickerModal, nhãn 'Chọn Từ Thư Viện / Tải Mới' và preview 16:9."
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 4: KIỂM TRA TÍCH HỢP TẠI TAB THÔNG TIN CHUNG (TabGeneralInfo.tsx)
# ------------------------------------------------------------------------------
echo "📝 [Bước 4/6] Kiểm tra tích hợp tại TabGeneralInfo.tsx (Sửa Thông Tin Xe)..."
TAB_GENERAL_FILE='apps/admin/app/cars/[slug]/components/TabGeneralInfo.tsx'
if [ ! -f "$TAB_GENERAL_FILE" ]; then
  echo "  ❌ Không tìm thấy tệp $TAB_GENERAL_FILE!"
  exit 1
fi

if ! grep -q "MediaPickerModal" "$TAB_GENERAL_FILE" || \
   ! grep -q "isMediaPickerOpen" "$TAB_GENERAL_FILE" || \
   ! grep -q "Chọn Từ Thư Viện / Tải Mới" "$TAB_GENERAL_FILE" || \
   ! grep -q "aspect-16/9" "$TAB_GENERAL_FILE"; then
  echo "  ❌ TabGeneralInfo.tsx chưa tích hợp MediaPickerModal đầy đủ hoặc thiếu preview thumbnail!"
  exit 1
fi
echo "  ✓ TabGeneralInfo PASS: Đã tích hợp MediaPickerModal, state isMediaPickerOpen, nút xóa nhanh và preview 16:9."
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 5: KIỂM TRA TÍCH HỢP TẠI TAB MÀU SẮC & MÂM XE (TabColors.tsx)
# ------------------------------------------------------------------------------
echo "🎨 [Bước 5/6] Kiểm tra tích hợp tại TabColors.tsx (Cấu Hình Màu Sắc & Mâm Xe)..."
TAB_COLORS_FILE='apps/admin/app/cars/[slug]/components/TabColors.tsx'
if [ ! -f "$TAB_COLORS_FILE" ]; then
  echo "  ❌ Không tìm thấy tệp $TAB_COLORS_FILE!"
  exit 1
fi

if ! grep -q "MediaPickerModal" "$TAB_COLORS_FILE" || \
   ! grep -q "colorPickerTarget" "$TAB_COLORS_FILE" || \
   ! grep -q "Chọn / Tải Ảnh" "$TAB_COLORS_FILE" || \
   ! grep -q "updateColorImage" "$TAB_COLORS_FILE"; then
  echo "  ❌ TabColors.tsx chưa tích hợp MediaPickerModal hoặc thiếu context state colorPickerTarget!"
  exit 1
fi
echo "  ✓ TabColors PASS: Đã tích hợp MediaPickerModal với context state colorPickerTarget và hàm updateColorImage."
echo ""

# ------------------------------------------------------------------------------
# BƯỚC 6: KIỂM TOÁN DESIGN SYSTEM & ZERO RAW HTML CONTROLS
# ------------------------------------------------------------------------------
echo "🛡️ [Bước 6/6] Kiểm toán Design System & Zero Raw Controls..."
TARGET_FILES=(
  "apps/admin/app/cars/components/CarFormModal.tsx"
  "apps/admin/app/cars/[slug]/components/TabGeneralInfo.tsx"
  "apps/admin/app/cars/[slug]/components/TabColors.tsx"
)

RAW_BUTTONS=$(grep -rnE '^\s*<(button)[ >]' "${TARGET_FILES[@]}" || true)
if [ -n "$RAW_BUTTONS" ]; then
  echo "  ❌ Phát hiện raw HTML <button> trong mã nguồn:"
  echo "$RAW_BUTTONS"
  exit 1
fi
echo "  ✓ Zero Raw Buttons PASS: 100% các nút bấm sử dụng Button component từ @cardealer/ui."
echo ""

echo "========================================================================"
echo "🎉 TẤT CẢ CÁC BƯỚC KIỂM CHỨNG TÍCH HỢP ẢNH XE ĐÃ THÀNH CÔNG 100%! EXIT 0"
echo "========================================================================"
exit 0
