import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  API_PORT: z.coerce.number().default(4000),
  API_SECRET_KEY: z.string().min(8).optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000/api'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function validateServerEnv(env: Record<string, unknown> = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ Invalid Server Environment Variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid Server Environment Variables');
  }
  return parsed.data;
}

export function validateClientEnv(env: Record<string, unknown> = process.env): ClientEnv {
  const parsed = clientEnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ Invalid Client Environment Variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid Client Environment Variables');
  }
  return parsed.data;
}
