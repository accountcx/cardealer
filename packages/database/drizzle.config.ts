import { defineConfig } from 'drizzle-kit';
import path from 'node:path';
import fs from 'node:fs';

// 🧠 Mental Model: Tự động nạp .env từ thư mục gốc Monorepo cho Drizzle Kit
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

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cardealer_dev?schema=public',
  },
  verbose: true,
  strict: true,
});
