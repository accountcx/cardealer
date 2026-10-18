#!/bin/bash

# ==============================================================================
# 🚀 CARDEALER MONOREPO - PM2 PRODUCTION DEPLOYER (ZERO NGINX RECONFIG)
# Khớp 100% với cấu hình Nginx hiện tại của hệ thống:
#   - xehyundaivinh.com     -> localhost:3001 (cardealer-frontend / apps/web)
#   - cms.xehyundaivinh.com -> localhost:3000 (cardealer-admin    / apps/admin)
#   - Internal REST API     -> localhost:4000 (cardealer-backend  / apps/api)
#   - cardealer-postgres    -> Giữ nguyên container Docker PostgreSQL đang chạy
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "======================================================================"
echo "   🚀 CARDEALER PRODUCTION - PM2 DEPLOYMENT (PORT 3001 / 3000 / 4000)"
echo "======================================================================"

# 1. Kích hoạt Node.js v24 qua NVM nếu có trên server
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null 2>&1 || nvm use >/dev/null 2>&1 || true
fi

echo "📍 Node.js : $(node -v)"
echo "📦 pnpm    : $(pnpm -v)"

# 2. Kiểm tra và cài đặt PM2 nếu chưa có
if ! command -v pm2 >/dev/null 2>&1; then
  echo "⚙️  Đang cài đặt PM2 toàn cục..."
  npm install -g pm2
fi

mkdir -p "$ROOT_DIR/logs"

# 3. Cài đặt dependencies & Build Production với API_PORT=4000 (Internal API)
echo "🔨 Đang cài đặt dependencies và build Production (API_PORT=4000)..."
pnpm install --no-frozen-lockfile --prod=false
API_PORT=4000 INTERNAL_API_URL="http://127.0.0.1:4000" pnpm build

# 4. Dừng toàn bộ 3 container Docker của dự án cũ (cardealer-frontend, cardealer-backend, cardealer-postgres)
#    để giải phóng port 3001, 3000 và tiết kiệm RAM (Dự án mới dùng Neon Cloud DB)
if command -v docker >/dev/null 2>&1; then
  for cname in cardealer-frontend cardealer-backend cardealer-postgres; do
    if [ -n "$(docker ps -q -f name=^/${cname}$ 2>/dev/null)" ]; then
      echo "🛑 Đang tắt auto-restart và dừng container cũ: $cname..."
      docker update --restart=no "$cname" >/dev/null 2>&1 || true
      docker stop "$cname"
    fi
  done
fi

# 5. Khởi chạy / Reload hệ thống qua PM2
echo "🚀 Đang khởi chạy các dịch vụ với PM2 (ecosystem.config.cjs)..."
pm2 startOrReload "$ROOT_DIR/ecosystem.config.cjs" --update-env
pm2 save

echo ""
echo "✅ Hoàn tất triển khai PM2 Production (Không cần sửa Nginx)!"
echo "   - Storefront (xehyundaivinh.com)     : http://127.0.0.1:3001 (cardealer-frontend)"
echo "   - Admin CMS  (cms.xehyundaivinh.com) : http://127.0.0.1:3000 (cardealer-admin)"
echo "   - Backend API (Internal Rewrite)     : http://127.0.0.1:4000 (cardealer-backend)"
echo ""
pm2 status
