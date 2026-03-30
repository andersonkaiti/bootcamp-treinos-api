import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.string(),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
})

export const env = envSchema.parse(process.env)
