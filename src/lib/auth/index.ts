import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { sendResetPasswordEmail, sendVerificationEmail } from '@/lib/email/send'

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, name: user.name, url })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url })
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],
})

export type Session = typeof auth.$Infer.Session
