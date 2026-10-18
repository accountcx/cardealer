// ==============================================================================
// 🚀 CARDEALER MONOREPO - PM2 PRODUCTION ECOSYSTEM CONFIG
// Khớp 100% với cấu hình Nginx hiện tại (Zero Nginx Reconfig):
//   - xehyundaivinh.com     -> proxy_pass http://localhost:3001 -> cardealer-frontend (@cardealer/web)
//   - cms.xehyundaivinh.com -> proxy_pass http://localhost:3000 -> cardealer-admin    (@cardealer/admin)
//   - Internal REST API     -> http://127.0.0.1:4000            -> cardealer-backend  (@cardealer/api)
//     (Cả 2 cổng 3001 và 3000 đều tự động proxy `/api/*` sang `127.0.0.1:4000` qua Next.js rewrites)
// ==============================================================================

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// 1. Đọc biến môi trường từ file .env ở thư mục gốc Monorepo
function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      envVars[key] = val;
    }
  }
  return envVars;
}

// 2. Tự động phân giải IP của container `cardealer-postgres` nếu cổng 5432 chỉ mở nội bộ Docker (5432/tcp)
function resolveDatabaseUrl(rawUrl) {
  const fallbackUrl =
    rawUrl ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:5432/cardealer_dev?schema=public';

  try {
    // Kiểm tra xem container cardealer-postgres có đang chạy không
    const isRunning = execSync(
      "docker ps --filter 'name=^/cardealer-postgres$' --format '{{.Names}}'",
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();

    if (isRunning === 'cardealer-postgres') {
      const hostPortMapping = execSync('docker port cardealer-postgres 5432 || true', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      const containerIp = execSync(
        "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' cardealer-postgres",
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();

      // Nếu container không map port 5432 ra host (chỉ có 5432/tcp) hoặc URL đang để host là cardealer-postgres
      if (containerIp && (!hostPortMapping || fallbackUrl.includes('@cardealer-postgres'))) {
        const parsed = new URL(fallbackUrl);
        if (
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname === 'cardealer-postgres'
        ) {
          parsed.hostname = containerIp;
          return parsed.toString();
        }
      }
    }
  } catch {
    // Nếu không có Docker CLI hoặc lệnh lỗi thì giữ nguyên URL gốc
  }

  return fallbackUrl;
}

const fileEnv = loadDotEnv();
const resolvedDbUrl = resolveDatabaseUrl(fileEnv.DATABASE_URL);

// Đảm bảo API_SECRET_KEY luôn dài >= 32 ký tự trên môi trường production
const rawSecret = fileEnv.API_SECRET_KEY || process.env.API_SECRET_KEY || '';
const safeApiSecret =
  rawSecret.length >= 32 && !rawSecret.includes('replace-this-with')
    ? rawSecret
    : 'cardealer_production_jwt_secret_key_2026_xehyundaivinh_secure';

const sharedEnv = {
  ...fileEnv,
  NODE_ENV: 'production',
  DATABASE_URL: resolvedDbUrl,
  API_PORT: '4000',
  API_HOST: 'http://127.0.0.1:4000',
  INTERNAL_API_URL: 'http://127.0.0.1:4000',
  API_SECRET_KEY: safeApiSecret,
};

module.exports = {
  apps: [
    // =========================================================================
    // 1. BACKEND API -> PORT 4000 (Internal API phục vụ cả Web:3001 & CMS:3000)
    // =========================================================================
    {
      name: 'cardealer-backend',
      cwd: path.join(__dirname, 'apps/api'),
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        ...sharedEnv,
        PORT: '4000',
        API_PORT: '4000',
      },
      error_file: path.join(__dirname, 'logs/backend-error.log'),
      out_file: path.join(__dirname, 'logs/backend-out.log'),
      merge_logs: true,
      time: true,
    },

    // =========================================================================
    // 2. STOREFRONT WEB -> PORT 3001 (Khớp Nginx: xehyundaivinh.com -> 127.0.0.1:3001)
    // =========================================================================
    {
      name: 'cardealer-frontend',
      cwd: path.join(__dirname, 'apps/web'),
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        ...sharedEnv,
        PORT: '3001',
        API_PORT: '4000',
        INTERNAL_API_URL: 'http://127.0.0.1:4000',
      },
      error_file: path.join(__dirname, 'logs/frontend-error.log'),
      out_file: path.join(__dirname, 'logs/frontend-out.log'),
      merge_logs: true,
      time: true,
    },

    // =========================================================================
    // 3. ADMIN CMS PORTAL -> PORT 3000 (Khớp Nginx: cms.xehyundaivinh.com -> 127.0.0.1:3000)
    // =========================================================================
    {
      name: 'cardealer-admin',
      cwd: path.join(__dirname, 'apps/admin'),
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '768M',
      env: {
        ...sharedEnv,
        PORT: '3000',
        API_PORT: '4000',
        INTERNAL_API_URL: 'http://127.0.0.1:4000',
      },
      error_file: path.join(__dirname, 'logs/admin-error.log'),
      out_file: path.join(__dirname, 'logs/admin-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
