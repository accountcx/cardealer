import path from 'node:path';
import fs from 'node:fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 🧠 Mental Model: Tự động phát hiện và nạp .env từ thư mục gốc Monorepo
function ensureEnvLoaded() {
  if (process.env.DATABASE_URL) return;
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const envFile = path.join(dir, '.env');
    if (fs.existsSync(envFile)) {
      if (typeof (process as { loadEnvFile?: (path: string) => void }).loadEnvFile === 'function') {
        try {
          (process as { loadEnvFile: (path: string) => void }).loadEnvFile(envFile);
        } catch {}
      }
      break;
    }
    dir = path.dirname(dir);
  }
}

ensureEnvLoaded();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cardealer';

// Log máy chủ Database đang kết nối (giấu credential để bảo mật)
try {
  const urlObj = new URL(connectionString);
  console.log(`🔌 [Database] Đang kết nối tới máy chủ: ${urlObj.hostname}:${urlObj.port || 5432} | DB: ${urlObj.pathname.replace(/^\//, '')}`);
} catch {
  console.log('🔌 [Database] Đang kết nối tới Database URL');
}

// Connection pool với cấu hình an toàn chống cạn kiệt pool (R1 Mitigation)
export const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  onnotice: () => {}, // suppress notices
});

export const db = drizzle(queryClient, { schema });

export async function checkDatabaseHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    await queryClient`SELECT 1`;
    return { ok: true, message: 'PostgreSQL connection is healthy and active' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Database offline or unreachable: ${errorMsg}` };
  }
}

export { schema };
