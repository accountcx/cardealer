#!/bin/bash

# ==============================================================================
# 🚗 CARDEALER MONOREPO - ALL-IN-ONE LOCAL DEV RUNNER 🚗
# Tự động dọn dẹp port, kích hoạt Node v24 và khởi chạy cả 3 Projects:
#   1. Storefront Web (Next.js 15)  -> Port 3002
#   2. Admin Portal   (Next.js 15)  -> Port 3001
#   3. Backend API    (Node REST)   -> Port 4000
# ==============================================================================

set -e

# Thiết lập màu sắc hiển thị
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_CYAN='\033[0;36m'
C_MAGENTA='\033[0;35m'
C_BOLD='\033[1m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo -e "${C_CYAN}${C_BOLD}"
echo "======================================================================"
echo "      🚗 CARDEALER MONOREPO - FULLSTACK DEV ORCHESTRATOR 🚗"
echo "======================================================================"
echo -e "${C_RESET}"

# 1. Tự động kích hoạt Node.js v24 qua NVM nếu có
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null 2>&1 || nvm use >/dev/null 2>&1 || true
fi

NODE_VER=$(node -v 2>/dev/null || echo "Unknown")
PNPM_VER=$(pnpm -v 2>/dev/null || echo "Unknown")

echo -e "  📍 Node.js Version : ${C_GREEN}${NODE_VER}${C_RESET}"
echo -e "  📦 pnpm Version    : ${C_GREEN}${PNPM_VER}${C_RESET}"
echo -e "  📂 Workspace Root  : ${C_BLUE}${ROOT_DIR}${C_RESET}"

# Nạp biến môi trường từ file .env gốc
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
  if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')
    echo -e "  🗄️  Database Target   : ${C_GREEN}${DB_HOST}${C_RESET} (${C_CYAN}${DB_NAME}${C_RESET})"
  fi
fi
echo ""

# 2. Hàm kiểm tra và giải phóng port nếu đang bị chiếm dụng
cleanup_port() {
  local port=$1
  local pids=$(lsof -ti tcp:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${C_YELLOW}⚠️  Cổng $port đang bị chiếm dụng (PID: $pids). Đang giải phóng...${C_RESET}"
    for pid in $pids; do
      kill -9 $pid 2>/dev/null || true
    done
    sleep 0.5
  fi
}

echo -e "${C_BLUE}🔍 Bước 1: Kiểm tra và dọn dẹp các cổng mạng 3002, 3001, 4000...${C_RESET}"
cleanup_port 3002
cleanup_port 3001
cleanup_port 4000
echo -e "${C_GREEN}✅ Các cổng mạng đã sẵn sàng!${C_RESET}"
echo ""

# 3. Kiểm tra dependencies
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo -e "${C_YELLOW}⚠️  Chưa tìm thấy node_modules. Đang chạy 'pnpm install'...${C_RESET}"
  pnpm install
  echo ""
fi

# Biến lưu PID của Turborepo
RUNNER_PID=""

cleanup_all() {
  echo ""
  echo -e "${C_YELLOW}${C_BOLD}🛑 Đang dừng toàn bộ 3 dịch vụ...${C_RESET}"
  if [ -n "$RUNNER_PID" ]; then
    kill -TERM "$RUNNER_PID" 2>/dev/null || true
  fi
  sleep 1
  cleanup_port 3002
  cleanup_port 3001
  cleanup_port 4000
  echo -e "${C_GREEN}✅ Đã dừng an toàn tất cả các tiến trình. Hẹn gặp lại!${C_RESET}"
  exit 0
}

trap cleanup_all SIGINT SIGTERM

echo -e "${C_GREEN}🚀 Bước 2: Khởi chạy đồng thời 3 Projects qua Turborepo Pipeline...${C_RESET}"
echo ""
echo -e "${C_GREEN}${C_BOLD}======================================================================${C_RESET}"
echo -e "${C_GREEN}${C_BOLD}  🎉 TẤT CẢ CÁC DỊCH VỤ ĐANG SẴN SÀNG TRUY CẬP: 🎉${C_RESET}"
echo -e "${C_GREEN}${C_BOLD}======================================================================${C_RESET}"
echo -e "  🌐 ${C_BOLD}Storefront (Khách hàng):${C_RESET} ${C_CYAN}http://localhost:3002${C_RESET}"
echo -e "  🛠️  ${C_BOLD}Admin Portal (Quản trị):${C_RESET}  ${C_CYAN}http://localhost:3001${C_RESET}"
echo -e "  ⚡ ${C_BOLD}Backend API Service:${C_RESET}     ${C_CYAN}http://localhost:4000${C_RESET}"
echo -e "  📡 ${C_BOLD}API Healthcheck:${C_RESET}         ${C_CYAN}http://localhost:4000/api/health${C_RESET}"
echo ""
echo -e "${C_YELLOW}👉 Nhấn [Ctrl + C] bất kỳ lúc nào để dừng cả 3 ứng dụng cùng lúc.${C_RESET}"
echo "----------------------------------------------------------------------"
echo ""

# Khởi chạy Turborepo dev runner ở chế độ stream trực tiếp
exec pnpm dev
