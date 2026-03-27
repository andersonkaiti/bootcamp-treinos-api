import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer, openAPI } from 'better-auth/plugins'
import { env } from '../config/env'
import { prisma } from './db'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS.split(','),
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [openAPI(), bearer()],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: '.treinai.space',
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
})
