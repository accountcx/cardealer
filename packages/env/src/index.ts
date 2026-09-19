import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  API_PORT: z.coerce.number().default(4000),
  API_SECRET_KEY: z.string().min(8).optional(),
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

// 🧠 Mental Model: Singleton Client Env dùng chung cho toàn bộ Frontend / Admin UI
export const clientEnv: ClientEnv = validateClientEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
