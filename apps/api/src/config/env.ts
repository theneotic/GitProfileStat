import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load application environment files outside tests. Vitest setupFiles establishes test-safe values first.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config(); // fallback to local .env
}

/**
 * Validated runtime configuration schema for the Express API.
 */
const envSchema = z
  .object({
    /** Node runtime environment */
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    /** HTTP listening port */
    PORT: z.coerce.number().default(4000),
    /** Frontend base URL without trailing slash (used for CORS and OAuth redirects) */
    WEB_BASE_URL: z
      .string()
      .default('http://localhost:3000')
      .transform((val) => val.replace(/\/+$/, '')),
    /** Pino logger log level */
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    /** GitHub OAuth App Client ID */
    GITHUB_CLIENT_ID: z.string(),
    /** GitHub OAuth App Client Secret */
    GITHUB_CLIENT_SECRET: z.string(),
    /** GitHub OAuth Callback URL */
    GITHUB_CALLBACK_URL: z.string(),
    /** GitHub Personal Access Token for rate limit headroom */
    GITHUB_TOKEN: z.string(),
    /** 32+ char secret for JWT and session signing */
    SESSION_SECRET: z.string().min(32),
    /** Neon PostgreSQL connection URI */
    DATABASE_URL: z.string().min(1).optional(),
    /** Upstash Redis REST endpoint */
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    /** Upstash Redis REST bearer token */
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .superRefine((values, context) => {
    const hasRedisUrl = Boolean(values.UPSTASH_REDIS_REST_URL);
    const hasRedisToken = Boolean(values.UPSTASH_REDIS_REST_TOKEN);
    if (hasRedisUrl !== hasRedisToken) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UPSTASH_REDIS_REST_URL'],
        message: 'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
