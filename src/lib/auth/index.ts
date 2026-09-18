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
    autoSignInAfterVerification: true,
    callbackURL: '/dashboard',
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        // Login com Google não coleta WhatsApp — a conta é criada sem telefone e
        // o gate em (onboarding)/layout.tsx redireciona pra completar antes de
        // seguir. Cadastro por e-mail continua exigindo o campo no formulário.
        required: false,
        unique: true,
        input: true,
      },
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'https://agendadinho.com.br',
    'https://www.agendadinho.com.br',
    'https://*.vercel.app',
  ],
})

export type Session = typeof auth.$Infer.Session
