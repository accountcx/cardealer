import { z } from 'zod';

// 🧠 Mental Model: Centralized Constants cho URLs mặc định của Showroom
export const DEFAULT_SITE_URL = 'https://xehyundaivinh.com';
export const DEFAULT_DEV_SITE_URL = 'http://localhost:3000';
export const DEFAULT_API_URL = 'http://localhost:4000';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  API_PORT: z.coerce.number().default(4000),
  API_SECRET_KEY: z.string().min(8).optional(),
  INTERNAL_API_URL: z.string().url().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

// 🧠 Mental Model: Hàm xác thực biến môi trường Server với cơ chế Fail-Fast lúc khởi động
export function validateServerEnv(env: Record<string, unknown> = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ Invalid Server Environment Variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid Server Environment Variables');
  }
  return parsed.data;
}

// 🧠 Mental Model: Hàm xác thực biến môi trường Client (Next.js inlines NEXT_PUBLIC_* at build-time)
export function validateClientEnv(env: Record<string, unknown> = process.env): ClientEnv {
  const parsed = clientEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ Invalid Client Environment Variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid Client Environment Variables');
  }
  return parsed.data;
}

// 🧠 Mental Model: Singleton Client Env dùng chung cho toàn bộ Frontend / Admin UI (Invariant 13)
export const clientEnv: ClientEnv = validateClientEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

// 🧠 Mental Model: Hàm lấy API Base URL an toàn cho Server-side (SSR / ISR / Docker nội bộ) và Client-side
export function getServerApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    clientEnv.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/+$/, '');
}

// 🧠 Mental Model: Hàm lấy Site URL chuẩn cho Storefront (Canonical SEO, JSON-LD Schema, Sitemap)
export function getSiteUrl(): string {
  const url = clientEnv.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return url.replace(/\/+$/, '');
}
