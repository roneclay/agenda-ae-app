# AgendaAe — CLAUDE.md v3

> Stack otimizada para custo zero em dev, performance máxima em prod.
> Sem Supabase, sem Docker em dev. Postgres direto na VPS em prod.

---

## GETTING STARTED — primeira vez rodando

```bash
# 1. Instalar Postgres local (uma vez só)
brew install postgresql@18
brew services start postgresql@18
createdb agendaae_dev

# 2. Criar o projeto
mkdir agendaae && cd agendaae

# 3. Abrir Claude Code e mandar:
claude
# → "Leia o CLAUDE.md e execute todos os passos em ordem, confirmando cada um"

# 4. Após scaffold, configurar .env.local
cp .env.example .env.local
# Preencher DATABASE_URL, AUTH_SECRET, RESEND_API_KEY

# 5. Aplicar schema
bun run db:push

# 6. Rodar testes
bun run test

# 7. Subir servidor
bun run dev
# → http://localhost:3000
```

**Dia a dia:**

```bash
bun run dev      # servidor local
bun run test     # antes de qualquer commit
bun run db:push  # após mudar o schema
```

---

## CONTEXTO DO PRODUTO

**AgendaAe** é uma plataforma SaaS de agendamento WhatsApp-first multi-nicho.
Um único motor de código deployado em múltiplos domínios/nichos.
Analogia: Magento é o motor — cada domínio é um nicho diferente.

**Nichos planejados:**

- `beauty` — profissionais de beleza autônomos (nail, lash, cabelo, barba)
- `legal` — advogados autônomos
- `petcare` — veterinários e petshops
- `fitness` — personal trainers

**Como funciona:**

1. Profissional cadastra → confirma email → configura serviços e horários
2. Recebe link público `/agendar/[slug]`
3. Cliente acessa o link → seleciona serviços → agenda → confirma no WhatsApp
4. Bot de IA no WhatsApp (Claude Haiku) agenda, remarca e cancela em linguagem natural
5. Lembretes automáticos 24h e 2h antes (WhatsApp + email backup)
6. Profissional paga R$49/mês (beauty) via PIX recorrente — AbacatePay

---

## STACK — não alterar sem motivo explícito

| Camada      | Tecnologia                                     | Motivo                                     |
| ----------- | ---------------------------------------------- | ------------------------------------------ |
| Runtime     | **Bun**                                        | Mais rápido que Node, test runner built-in |
| Framework   | **Next.js 16** (App Router)                    | Full-stack — API routes + frontend         |
| Linguagem   | **TypeScript** strict                          | Segurança de tipos em todo o projeto       |
| ORM         | **Drizzle ORM**                                | Leve, type-safe, migrations simples        |
| Banco dev   | **Postgres 18** via Homebrew                   | Local, sem Docker, sem custo               |
| Banco prod  | **Postgres 18** na própria VPS                 | Mesmo servidor do app, latência zero       |
| Auth        | **Better Auth**                                | Drizzle nativo, emails integrados, simples |
| Email       | **Resend + React Email**                       | 3k emails/mês grátis, API de uma linha     |
| UI          | **shadcn/ui** + Tailwind v4                    | Componentes prontos, zero design           |
| Lint/Format | **Biome**                                      | Substitui ESLint + Prettier, zero config   |
| Testes unit | **Bun test**                                   | Built-in, sem setup                        |
| Testes E2E  | **Playwright**                                 | Fluxos completos no browser                |
| IA          | **Claude Haiku** (`claude-haiku-4-5-20251001`) | Tool calling, barato (~R$0,005/conversa)   |
| Pagamento   | **AbacatePay**                                 | PIX recorrente, API brasileira             |
| Pagamento fallback  | **Stripe**                                 | Cartão de crédito recorrente para quem não usa PIX  |
| Deploy      | **Coolify** na VPS                             | PaaS self-hosted, auto-deploy por branch   |
| CI          | **GitHub Actions**                             | Testes antes de qualquer deploy            |
| Infra       | **Qualquer VPS Linux**                         | Hetzner, Hostinger, DigitalOcean, etc.     |

**O que NÃO usamos e por quê:**

- ~~Supabase~~ — VPS já tem Postgres, não faz sentido serviço externo
- ~~Docker em dev~~ — Postgres via Homebrew é mais leve e rápido
- ~~NextAuth~~ — Better Auth tem melhor integração com Drizzle e emails
- ~~Prisma~~ — Drizzle é mais leve e tem melhor DX com Bun
- ~~Paddle/Stripe~~ — AbacatePay é mais barato para PIX Brasil

---

## PASSO 1 — Scaffold

```bash
# Criar projeto
bunx create-next-app@latest . \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --use-bun --no-turbopack

# Dependências de produção
bun add \
  drizzle-orm postgres \
  better-auth \
  resend react-email \
  @anthropic-ai/sdk \
  zod date-fns date-fns-tz \
  node-cron \
  @types/node-cron

# Dependências de desenvolvimento
bun add -d \
  drizzle-kit \
  @biomejs/biome \
  @playwright/test \
  @types/bun

# shadcn/ui
bunx shadcn@latest init --defaults
bunx shadcn@latest add \
  button input label card badge sonner \
  calendar dialog sheet tabs avatar \
  separator skeleton select textarea
# form separado (requer react-hook-form)
bun add react-hook-form @hookform/resolvers zod
bunx shadcn@latest add form

# Playwright
bunx playwright install chromium

# Biome
bunx @biomejs/biome init
```

---

## PASSO 2 — Estrutura de pastas

```
agendaae/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── cadastro/page.tsx
│   │   │   ├── verificar-email/page.tsx
│   │   │   └── resetar-senha/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ← protegido por auth
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            ← agenda do dia
│   │   │       ├── servicos/page.tsx
│   │   │       ├── clientes/page.tsx
│   │   │       ├── financeiro/page.tsx
│   │   │       └── configuracoes/page.tsx
│   │   ├── (onboarding)/
│   │   │   └── onboarding/page.tsx     ← pós-cadastro: nome, horários, serviços
│   │   ├── agendar/
│   │   │   └── [slug]/page.tsx         ← pública, sem auth
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...all]/route.ts   ← Better Auth handler
│   │       ├── whatsapp/
│   │       │   └── route.ts            ← webhook Meta (POST público)
│   │       ├── appointments/
│   │       │   └── route.ts
│   │       ├── availability/
│   │       │   └── route.ts
│   │       └── webhooks/
│   │           └── abacatepay/
│   │               └── route.ts
│   ├── lib/
│   │   ├── config/
│   │   │   └── niches.ts               ← CENTRAL: config multi-nicho
│   │   ├── db/
│   │   │   ├── index.ts                ← conexão Drizzle
│   │   │   └── schema.ts               ← schema completo
│   │   ├── auth/
│   │   │   └── index.ts                ← Better Auth config
│   │   ├── email/
│   │   │   ├── index.ts                ← Resend client
│   │   │   ├── send.ts                 ← funções de envio
│   │   │   └── templates/
│   │   │       ├── boas-vindas.tsx
│   │   │       ├── verificar-email.tsx
│   │   │       ├── resetar-senha.tsx
│   │   │       ├── trial-expirando.tsx
│   │   │       ├── trial-expirado.tsx
│   │   │       ├── assinatura-ativa.tsx
│   │   │       ├── pagamento-confirmado.tsx
│   │   │       ├── pagamento-falhou.tsx
│   │   │       ├── cancelamento.tsx
│   │   │       ├── novo-agendamento-profissional.tsx
│   │   │       ├── confirmacao-cliente.tsx
│   │   │       └── lembrete-cliente.tsx
│   │   ├── ai/
│   │   │   ├── agent.ts
│   │   │   ├── tools.ts
│   │   │   ├── tools-executor.ts
│   │   │   └── mock.ts
│   │   ├── whatsapp/
│   │   │   ├── send.ts
│   │   │   └── mock.ts
│   │   ├── scheduler.ts                ← lembretes automáticos (node-cron)
│   │   └── utils.ts
│   ├── components/
│   │   ├── booking/                    ← /agendar/[slug]
│   │   ├── dashboard/
│   │   └── ui/                         ← shadcn (auto-gerado)
│   ├── middleware.ts                   ← detecta nicho pelo host + protege rotas
│   └── types/index.ts
├── emails/                             ← preview de emails (React Email)
│   └── preview/
├── supabase/                           ← pasta pode ser ignorada/removida
├── tests/
│   ├── unit/
│   │   ├── niches.test.ts
│   │   ├── availability.test.ts
│   │   ├── agent-mock.test.ts
│   │   └── email.test.ts
│   └── e2e/
│       ├── auth-flow.spec.ts           ← cadastro → verificação → login
│       ├── booking-flow.spec.ts        ← selecionar serviço → agendar
│       └── dashboard.spec.ts
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── docker/
│   └── Dockerfile                      ← só para produção (Coolify)
├── .env.example
├── .env.local
├── biome.json
├── drizzle.config.ts
└── playwright.config.ts
```

---

## PASSO 3 — Variáveis de ambiente

### `.env.example`

```env
# MODO
NODE_ENV=development
AI_MOCK=true
WHATSAPP_MOCK=true
PAYMENT_MOCK=true
EMAIL_MOCK=true        # true = loga email no console, não envia

# NICHO (detectado pelo host em prod, forçado aqui em dev)
NICHE=beauty

# BANCO — Postgres local via Homebrew
DATABASE_URL=postgresql://postgres@localhost:5432/agendaae_dev

# AUTH — Better Auth
AUTH_SECRET=gerar_com_openssl_rand_base64_32
NEXT_PUBLIC_APP_URL=http://localhost:3000

# EMAIL — Resend (só quando EMAIL_MOCK=false)
RESEND_API_KEY=
EMAIL_FROM=AgendaAe <noreply@agendaae.com.br>

# CLAUDE API (só quando AI_MOCK=false)
ANTHROPIC_API_KEY=

# WHATSAPP (só quando WHATSAPP_MOCK=false)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=agendaae_verify_2026
WHATSAPP_APP_SECRET=

# PAGAMENTO (só quando PAYMENT_MOCK=false)
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=
```

---

## PASSO 4 — Biome

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "ignore": ["node_modules", ".next", "emails/.react-email"]
  }
}
```

### `package.json` — scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit",
    "test": "bun test",
    "test:e2e": "playwright test",
    "test:all": "bun run typecheck && bun run lint && bun run test && bun run test:e2e",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "email:dev": "react-email dev",
    "scheduler": "bun src/lib/scheduler.ts"
  }
}
```

---

## PASSO 5 — Schema Drizzle

### `src/lib/db/schema.ts`

```typescript
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  time,
  unique,
} from "drizzle-orm/pg-core";

// Enums
export const planEnum = pgEnum("plan", ["free", "pro"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trial",
  "active",
  "cancelled",
  "past_due",
]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
]);
export const reminderTypeEnum = pgEnum("reminder_type", [
  "confirmation",
  "reminder_24h",
  "reminder_2h",
  "followup",
]);
export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "tool",
]);
export const nicheEnum = pgEnum("niche", [
  "beauty",
  "legal",
  "petcare",
  "fitness",
]);

// Better Auth — tabelas obrigatórias
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domínio AgendaAe
export const professional = pgTable("professional", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  niche: nicheEnum("niche").notNull().default("beauty"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  phone: text("phone"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  address: text("address"),
  isAcceptingBookings: boolean("is_accepting_bookings").notNull().default(true),
  workingDays: text("working_days")
    .array()
    .default(["MON", "TUE", "WED", "THU", "FRI"]),
  openingTime: time("opening_time").default("09:00"),
  closingTime: time("closing_time").default("18:00"),
  lunchStart: time("lunch_start"),
  lunchEnd: time("lunch_end"),
  whatsappPhoneNumberId: text("whatsapp_phone_number_id"),
  whatsappBusinessAccountId: text("whatsapp_business_account_id"),
  whatsappAccessToken: text("whatsapp_access_token"),
  plan: planEnum("plan").notNull().default("free"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("trial"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  abacatepayCustomerId: text("abacatepay_customer_id"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const service = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professional.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(), // SEMPRE em centavos
  durationMinutes: integer("duration_minutes").notNull().default(60),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customer = pgTable(
  "customer",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professional.id, { onDelete: "cascade" }),
    whatsappId: text("whatsapp_id").notNull(), // E.164: +5548999999999
    email: text("email"), // opcional
    name: text("name"),
    lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
  },
  (t) => ({ uniq: unique().on(t.professionalId, t.whatsappId) }),
);

export const appointment = pgTable(
  "appointment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professional.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customer.id),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(), // soma dos serviços
    totalCents: integer("total_cents").notNull(), // soma dos preços (snapshot)
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    noOverlap: unique().on(t.professionalId, t.scheduledAt), // impede conflito
  }),
);

// Pivot: quais serviços compõem o agendamento
export const appointmentService = pgTable("appointment_service", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointment.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => service.id),
  priceCents: integer("price_cents").notNull(), // snapshot — não muda se o preço mudar
  durationMinutes: integer("duration_minutes").notNull(), // snapshot
});

export const availabilityBlock = pgTable("availability_block", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professional.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
});

export const conversation = pgTable(
  "conversation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professional.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customer.id),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  },
  (t) => ({ uniq: unique().on(t.professionalId, t.customerId) }),
);

export const message = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversation.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content"),
  toolCalls: text("tool_calls"),
  toolResults: text("tool_results"),
  tokensUsed: integer("tokens_used").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const notificationLog = pgTable("notification_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professional.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customer.id),
  appointmentId: uuid("appointment_id").references(() => appointment.id),
  type: reminderTypeEnum("type").notNull(),
  channel: text("channel").notNull().default("whatsapp"), // 'whatsapp' | 'email'
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow(),
  status: text("status").notNull().default("sent"),
});

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id").references(() => professional.id),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(), // nome do template usado
  resendId: text("resend_id"), // ID retornado pelo Resend
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

### `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres@localhost:5432/agendaae_dev",
  },
});
```

### `src/lib/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(
  process.env.DATABASE_URL ??
    "postgresql://postgres@localhost:5432/agendaae_dev",
);

export const db = drizzle(client, { schema });
export * from "./schema";
```

---

## PASSO 6 — Better Auth

### `src/lib/auth/index.ts`

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "@/lib/email/send";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
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
      await sendResetPasswordEmail({ to: user.email, name: user.name, url });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url });
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
```

### `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

---

## PASSO 7 — Email (Resend + React Email)

### `src/lib/email/index.ts`

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM =
  process.env.EMAIL_FROM ?? "AgendaAe <noreply@agendaae.com.br>";
```

### `src/lib/email/send.ts`

```typescript
import { resend, FROM } from "./index";
import { BoasVindasEmail } from "./templates/boas-vindas";
import { VerificarEmailTemplate } from "./templates/verificar-email";
import { ResetarSenhaTemplate } from "./templates/resetar-senha";
import { TrialExpirandoTemplate } from "./templates/trial-expirando";
import { TrialExpiradoTemplate } from "./templates/trial-expirado";
import { AssinaturaAtivaTemplate } from "./templates/assinatura-ativa";
import { PagamentoConfirmadoTemplate } from "./templates/pagamento-confirmado";
import { PagamentoFalhouTemplate } from "./templates/pagamento-falhou";
import { CancelamentoTemplate } from "./templates/cancelamento";
import { NovoAgendamentoProfissionalTemplate } from "./templates/novo-agendamento-profissional";
import { ConfirmacaoClienteTemplate } from "./templates/confirmacao-cliente";
import { LembreteClienteTemplate } from "./templates/lembrete-cliente";

const MOCK = process.env.EMAIL_MOCK === "true";

// Helper: envia ou loga no console se mock
async function send({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (MOCK) {
    console.log(`\n📧 [EMAIL MOCK] Para: ${to} | Assunto: ${subject}`);
    return { id: "mock-id" };
  }
  return resend.emails.send({ from: FROM, to, subject, react });
}

// ── Emails de Auth ──────────────────────────────────────
export async function sendVerificationEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  return send({
    to,
    subject: "Confirme seu email — AgendaAe",
    react: VerificarEmailTemplate({ name, url }),
  });
}

export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  return send({
    to,
    subject: "Redefinir sua senha — AgendaAe",
    react: ResetarSenhaTemplate({ name, url }),
  });
}

// ── Emails de Onboarding ────────────────────────────────
export async function sendBoasVindas({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return send({
    to,
    subject: `Bem-vindo(a) ao AgendaAe, ${name}!`,
    react: BoasVindasEmail({ name }),
  });
}

// ── Emails de Trial / Billing ───────────────────────────
export async function sendTrialExpirando({
  to,
  name,
  daysLeft,
}: {
  to: string;
  name: string;
  daysLeft: number;
}) {
  return send({
    to,
    subject: `Faltam ${daysLeft} dias do seu trial — AgendaAe`,
    react: TrialExpirandoTemplate({ name, daysLeft }),
  });
}

export async function sendTrialExpirado({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return send({
    to,
    subject: "Seu trial acabou — não perca seu link 😢",
    react: TrialExpiradoTemplate({ name }),
  });
}

export async function sendAssinaturaAtiva({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return send({
    to,
    subject: "Assinatura Pro ativada! 🎉 — AgendaAe",
    react: AssinaturaAtivaTemplate({ name }),
  });
}

export async function sendPagamentoConfirmado({
  to,
  name,
  amount,
  month,
}: {
  to: string;
  name: string;
  amount: string;
  month: string;
}) {
  return send({
    to,
    subject: `Pagamento confirmado — ${month}`,
    react: PagamentoConfirmadoTemplate({ name, amount, month }),
  });
}

export async function sendPagamentoFalhou({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return send({
    to,
    subject: "Não conseguimos cobrar sua assinatura ⚠️",
    react: PagamentoFalhouTemplate({ name }),
  });
}

export async function sendCancelamento({
  to,
  name,
  endsAt,
}: {
  to: string;
  name: string;
  endsAt: string;
}) {
  return send({
    to,
    subject: "Assinatura cancelada — AgendaAe",
    react: CancelamentoTemplate({ name, endsAt }),
  });
}

// ── Emails de Agendamento ───────────────────────────────
export async function sendNovoAgendamentoProfissional({
  to,
  professionalName,
  customerName,
  service,
  scheduledAt,
}: {
  to: string;
  professionalName: string;
  customerName: string;
  service: string;
  scheduledAt: string;
}) {
  return send({
    to,
    subject: `Novo agendamento — ${customerName}`,
    react: NovoAgendamentoProfissionalTemplate({
      professionalName,
      customerName,
      service,
      scheduledAt,
    }),
  });
}

export async function sendConfirmacaoCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
}: {
  to: string;
  customerName: string;
  professionalName: string;
  service: string;
  scheduledAt: string;
}) {
  return send({
    to,
    subject: `Agendamento confirmado — ${service}`,
    react: ConfirmacaoClienteTemplate({
      customerName,
      professionalName,
      service,
      scheduledAt,
    }),
  });
}

export async function sendLembreteCliente({
  to,
  customerName,
  professionalName,
  service,
  scheduledAt,
}: {
  to: string;
  customerName: string;
  professionalName: string;
  service: string;
  scheduledAt: string;
}) {
  return send({
    to,
    subject: `Lembrete — seu agendamento é amanhã ⏰`,
    react: LembreteClienteTemplate({
      customerName,
      professionalName,
      service,
      scheduledAt,
    }),
  });
}
```

### Template base (React Email) — `src/lib/email/templates/boas-vindas.tsx`

```tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

type Props = { name: string };

export function BoasVindasEmail({ name }: Props) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: "sans-serif",
          background: "#FBF6F0",
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "40px",
            maxWidth: 520,
          }}
        >
          <Heading style={{ color: "#C85C30", fontSize: 28, marginBottom: 8 }}>
            Bem-vindo(a) ao AgendaAe! 🎉
          </Heading>
          <Text style={{ color: "#4A3020", fontSize: 16, lineHeight: 1.6 }}>
            Oi, {name}! Sua conta foi criada com sucesso. Agora é só configurar
            seus serviços e horários para começar a receber agendamentos.
          </Text>
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`}
            style={{
              background: "#C85C30",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 8,
            }}
          >
            Configurar minha agenda →
          </Button>
          <Hr style={{ margin: "32px 0", borderColor: "#E2D0C0" }} />
          <Text style={{ color: "#8A6A58", fontSize: 13 }}>
            Você tem 14 dias de trial gratuito no plano Pro. Aproveite!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

> Criar todos os outros templates com o mesmo padrão visual.
> Usar a paleta: primary `#C85C30`, ink `#1A0800`, muted `#8A6A58`, bg `#FBF6F0`.

---

## PASSO 8 — Config multi-nicho

### `src/lib/config/niches.ts`

```typescript
export type ReminderTone = "informal" | "formal" | "affectionate";
export type NicheId = "beauty" | "legal" | "petcare" | "fitness";

export type NicheConfig = {
  niche: NicheId;
  primaryColor: string;
  appointmentNoun: string;
  professionalNoun: string;
  customerNoun: string;
  subjectNoun?: string;
  noShowSlang: string;
  fullAgendaSlang: string;
  reminderTone: ReminderTone;
  whatsappGreeting: string;
  proPriceCents: number;
  defaultServices: Array<{
    name: string;
    durationMinutes: number;
    priceCents: number;
  }>;
};

export const NICHES: Record<NicheId, NicheConfig> = {
  beauty: {
    niche: "beauty",
    primaryColor: "#C85C30",
    appointmentNoun: "atendimento",
    professionalNoun: "profissional",
    customerNoun: "cliente",
    noShowSlang: "deu um chumbo",
    fullAgendaSlang: "agenda travada",
    reminderTone: "informal",
    whatsappGreeting:
      "Oi! 😊 Sou a assistente de {name}. Posso ajudar com agendamentos!",
    proPriceCents: 4900,
    defaultServices: [
      { name: "Atendimento", durationMinutes: 60, priceCents: 8000 },
    ],
  },
  legal: {
    niche: "legal",
    primaryColor: "#1A3A5C",
    appointmentNoun: "consulta",
    professionalNoun: "advogado",
    customerNoun: "cliente",
    subjectNoun: "processo",
    noShowSlang: "faltou sem avisar",
    fullAgendaSlang: "agenda cheia",
    reminderTone: "formal",
    whatsappGreeting:
      "Olá! Sou o assistente do(a) {name}. Como posso ajudá-lo(a)?",
    proPriceCents: 9700,
    defaultServices: [
      { name: "Consulta inicial", durationMinutes: 60, priceCents: 0 },
    ],
  },
  petcare: {
    niche: "petcare",
    primaryColor: "#2E7D52",
    appointmentNoun: "sessão",
    professionalNoun: "profissional",
    customerNoun: "tutor",
    subjectNoun: "pet",
    noShowSlang: "não compareceu",
    fullAgendaSlang: "agenda lotada",
    reminderTone: "affectionate",
    whatsappGreeting:
      "Olá! 🐾 Sou a assistente de {name}. Posso ajudar a agendar para seu pet!",
    proPriceCents: 7900,
    defaultServices: [
      { name: "Banho e tosa", durationMinutes: 90, priceCents: 8000 },
    ],
  },
  fitness: {
    niche: "fitness",
    primaryColor: "#7B2D8B",
    appointmentNoun: "treino",
    professionalNoun: "personal",
    customerNoun: "aluno",
    noShowSlang: "faltou o treino",
    fullAgendaSlang: "sem horário disponível",
    reminderTone: "informal",
    whatsappGreeting:
      "Oi! 💪 Sou o assistente de {name}. Bora agendar seu treino?",
    proPriceCents: 4900,
    defaultServices: [
      { name: "Treino personalizado", durationMinutes: 60, priceCents: 10000 },
    ],
  },
};

export function getNicheFromHost(host: string): NicheConfig {
  if (process.env.NODE_ENV === "development") {
    return NICHES[(process.env.NICHE as NicheId) ?? "beauty"] ?? NICHES.beauty;
  }
  if (host.includes("agendaadv") || host.includes("legal")) return NICHES.legal;
  if (host.includes("agendapet") || host.includes("petcare"))
    return NICHES.petcare;
  if (host.includes("agendafit") || host.includes("fitness"))
    return NICHES.fitness;
  return NICHES.beauty;
}
```

---

## PASSO 9 — Agente IA

### `src/lib/ai/tools.ts`

```typescript
import type Anthropic from "@anthropic-ai/sdk";

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_services",
    description: "Lista os serviços disponíveis com preço e duração",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "check_availability",
    description:
      "Verifica horários disponíveis para uma lista de serviços em uma data. Retorna slots disponíveis, parciais e próxima data com slot completo.",
    input_schema: {
      type: "object",
      properties: {
        service_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs dos serviços selecionados",
        },
        date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["service_ids", "date"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Agenda um ou mais serviços. SEMPRE chame check_availability antes.",
    input_schema: {
      type: "object",
      properties: {
        service_ids: { type: "array", items: { type: "string" } },
        scheduled_at: { type: "string", description: "ISO 8601 com timezone" },
        customer_name: { type: "string" },
        customer_email: {
          type: "string",
          description: "opcional — para enviar confirmação por email",
        },
      },
      required: ["service_ids", "scheduled_at"],
    },
  },
  {
    name: "list_my_appointments",
    description: "Lista os próximos agendamentos do cliente",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "cancel_appointment",
    description: "Cancela um agendamento existente",
    input_schema: {
      type: "object",
      properties: { appointment_id: { type: "string" } },
      required: ["appointment_id"],
    },
  },
];

export const AGENT_CONFIG = {
  model: "claude-haiku-4-5-20251001",
  max_tokens: 300,
  temperature: 0.3,
  max_tool_iterations: 5,
} as const;
```

### `src/lib/ai/mock.ts`

```typescript
export function mockAgentResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("agendar") || m.includes("marcar") || m.includes("horário"))
    return "Claro! Qual atendimento você quer agendar? Tenho horários disponíveis essa semana 😊";
  if (m.includes("preço") || m.includes("valor") || m.includes("quanto"))
    return "Nossos atendimentos:\n• Unhas em gel — R$80 (1h)\n• Manutenção — R$60 (45min)\n\nQual prefere?";
  if (m.includes("disponível") || m.includes("vaga") || m.includes("horário"))
    return "Tenho horários livres:\n• Amanhã às 10h\n• Amanhã às 14h\n• Quinta às 16h\n\nQual fica melhor?";
  if (m.includes("cancelar") || m.includes("desmarcar"))
    return "Entendido! Vou cancelar seu agendamento. Quer remarcar para outro horário?";
  if (m.includes("sim") || m.includes("confirmar"))
    return "Confirmado! ✅ Você receberá um lembrete 24h antes. Até lá!";
  return "Oi! Posso agendar, remarcar ou cancelar um horário para você. Como posso ajudar? 😊";
}
```

---

## PASSO 10 — WhatsApp mock

### `src/lib/whatsapp/mock.ts`

```typescript
export async function sendWhatsAppMock(
  to: string,
  message: string,
): Promise<void> {
  console.log("\n📱 [WHATSAPP MOCK]");
  console.log(`Para: ${to}`);
  console.log(`Mensagem:\n${message}`);
  console.log("─".repeat(50));
}
```

---

## PASSO 11 — Testes

### `tests/unit/niches.test.ts`

```typescript
import { describe, expect, test } from "bun:test";
import { NICHES, getNicheFromHost } from "@/lib/config/niches";

describe("NICHES config", () => {
  test("todos os nichos têm campos obrigatórios", () => {
    for (const [key, config] of Object.entries(NICHES)) {
      expect(config.niche).toBe(key);
      expect(config.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(config.appointmentNoun).toBeTruthy();
      expect(config.proPriceCents).toBeGreaterThan(0);
    }
  });

  test("getNicheFromHost retorna beauty como fallback em produção", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(getNicheFromHost("desconhecido.com.br").niche).toBe("beauty");
    process.env.NODE_ENV = original;
  });

  test("detecta nicho legal pelo domínio", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(getNicheFromHost("agendaadv.com.br").niche).toBe("legal");
    process.env.NODE_ENV = original;
  });
});
```

### `tests/unit/agent-mock.test.ts`

```typescript
import { describe, expect, test } from "bun:test";
import { mockAgentResponse } from "@/lib/ai/mock";

describe("mockAgentResponse", () => {
  test("responde sobre agendamento", () => {
    expect(mockAgentResponse("quero agendar")).toContain("atendimento");
  });
  test("responde sobre preço", () => {
    expect(mockAgentResponse("qual o preço?")).toContain("R$");
  });
  test("responde sobre disponibilidade", () => {
    expect(mockAgentResponse("tem vaga?")).toContain("horários");
  });
  test("tem resposta padrão", () => {
    expect(mockAgentResponse("oi").length).toBeGreaterThan(10);
  });
});
```

### `tests/unit/email.test.ts`

```typescript
import { describe, expect, test, beforeAll } from "bun:test";

describe("Email send (mock mode)", () => {
  beforeAll(() => {
    process.env.EMAIL_MOCK = "true";
  });

  test("sendBoasVindas não lança erro", async () => {
    const { sendBoasVindas } = await import("@/lib/email/send");
    const result = await sendBoasVindas({ to: "test@test.com", name: "Teste" });
    expect(result).toBeDefined();
  });

  test("sendVerificationEmail não lança erro", async () => {
    const { sendVerificationEmail } = await import("@/lib/email/send");
    const result = await sendVerificationEmail({
      to: "test@test.com",
      name: "Teste",
      url: "http://localhost:3000/verificar",
    });
    expect(result).toBeDefined();
  });
});
```

### `tests/e2e/auth-flow.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("página de cadastro carrega", async ({ page }) => {
    await page.goto("/cadastro");
    await expect(page.locator("form")).toBeVisible();
  });

  test("página de login carrega", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
  });

  test("dashboard redireciona para login sem auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
```

### `tests/e2e/booking-flow.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Booking flow público", () => {
  test("página /agendar/demo carrega", async ({ page }) => {
    await page.goto("/agendar/demo");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("exibe lista de serviços", async ({ page }) => {
    await page.goto("/agendar/demo");
    await expect(page.locator('[data-testid="service-list"]')).toBeVisible();
  });
});
```

---

## PASSO 12 — Docker (só para produção)

### `docker/Dockerfile`

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["bun", "server.js"]
```

`next.config.ts`:

```typescript
const nextConfig = { output: "standalone" };
export default nextConfig;
```

---

## PASSO 13 — GitHub Actions

### `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      NODE_ENV: test
      AI_MOCK: true
      WHATSAPP_MOCK: true
      PAYMENT_MOCK: true
      EMAIL_MOCK: true
      NICHE: beauty
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/agendaae_test
      AUTH_SECRET: test-secret-32-chars-minimum-here
      NEXT_PUBLIC_APP_URL: http://localhost:3000

    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: agendaae_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with: { bun-version: latest }
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run db:push
      - run: bun run test
      - run: bun run build
```

### `.github/workflows/deploy.yml`

```yaml
name: Deploy
on:
  push:
    branches: [staging, main]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify — Staging
        run: curl --silent --fail -X GET "${{ secrets.COOLIFY_STAGING_WEBHOOK }}"

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify — Produção
        run: curl --silent --fail -X GET "${{ secrets.COOLIFY_PRODUCTION_WEBHOOK }}"
```

---

## PASSO 14 — Branches e Coolify

**Branches:**

```
main      ← produção (protegida, só PR de staging)
staging   ← homologação (auto-deploy)
develop   ← integração
feature/* ← features
hotfix/*  ← correções urgentes
```

**Coolify na VPS:**

```bash
# Rodar na VPS como root
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
# Acessar http://SEU_IP:8000 → conectar GitHub → configurar app
```

---

## REGRAS DE NEGÓCIO — Agendamento

### Múltiplos serviços por agendamento

- Cliente seleciona N serviços
- UI exibe resumo em tempo real: duração total + valor total
- `appointment.duration_minutes` = soma das durações
- `appointment.total_cents` = soma dos preços
- `appointment_service` registra snapshot de cada serviço (preço e duração não mudam retroativamente)

### Disponibilidade com tempo parcial

- **NUNCA bloquear ou ocultar** horários quando o tempo é insuficiente para todos os serviços
- Slots classificados: `available` (cabe tudo), `partial` (cabe parte), `unavailable`
- Quando só há slot parcial: sugerir os serviços que cabem + mostrar próxima data com slot completo
- Bot de IA segue a mesma lógica — nunca diz "não tem horário"

### Agenda pública

- `/agendar/[slug]` — sem login, sem cadastro
- Profissional controla `is_accepting_bookings` no dashboard
- Wizard em 4 etapas: serviços → horário → dados → confirmação

---

## REGRAS ABSOLUTAS — nunca violar

```
✅ Português do Brasil em toda UI e mensagens ao usuário
✅ Inglês em nomes de tabelas, colunas, funções, variáveis, tipos
✅ Preços SEMPRE em centavos no banco. Formatar só na UI (R$ 49,00)
✅ Datas SEMPRE ISO 8601 com timezone America/Sao_Paulo
✅ Verificar AI_MOCK antes de chamar Claude API
✅ Verificar WHATSAPP_MOCK antes de enviar WhatsApp
✅ Verificar EMAIL_MOCK antes de enviar email
✅ Verificar PAYMENT_MOCK antes de processar pagamento
✅ Toda query filtra por professionalId — sem exceção
✅ Validar todos os payloads de API com Zod
✅ Nunca hardcodar cores — sempre var(--color-primary) ou config do nicho
✅ Nunca hardcodar strings de nicho fora de niches.ts
✅ Snapshot de preço e duração em appointment_service no momento do booking
✅ CI deve passar antes de qualquer merge em staging ou main
✅ Oferecer sempre duas opções de pagamento no checkout: PIX (AbacatePay) e Cartão (Stripe)
✅ Nunca forçar PIX como único método — churn alto se o profissional esquecer de pagar
```

---

## COMANDOS DO DIA A DIA

```bash
# Desenvolvimento
bun run dev              # servidor em localhost:3000
bun run email:dev        # preview de emails em localhost:3001

# Banco
bun run db:push          # aplica schema (dev — sem migration file)
bun run db:generate      # gera migration file (prod)
bun run db:migrate       # aplica migrations (prod)
bun run db:studio        # UI do banco em localhost:4983

# Qualidade
bun run typecheck        # verifica TypeScript
bun run lint             # Biome lint
bun run format           # Biome format

# Testes
bun run test             # unitários
bun run test:e2e         # E2E Playwright
bun run test:all         # typecheck + lint + unit + E2E

# Prod local (igual à VPS)
docker build -f docker/Dockerfile -t agendaae .
docker run -p 3000:3000 --env-file .env.local agendaae
```

---

## FLUXOS PARA TESTAR LOCALMENTE

**Fluxo 1 — Cadastro completo:**
`/cadastro` → email de verificação (mock no console) → `/verificar-email` → `/onboarding` → `/dashboard`

**Fluxo 2 — Agendamento público:**
`/agendar/demo` → seleciona serviços → vê resumo de tempo/valor → escolhe horário → confirma → email mock no console

**Fluxo 3 — Bot WhatsApp mock:**
`POST /api/whatsapp` com payload simulado → bot responde via mock → loga no console

**Fluxo 4 — Multi-nicho:**
Muda `NICHE=legal` no `.env.local` → reinicia → UI muda cor para `#1A3A5C` e vocabulário para "consulta"

**Fluxo 5 — Emails:**
Com `EMAIL_MOCK=true` todos os emails aparecem no console do servidor.
Para ver o template visual: `bun run email:dev` → localhost:3001

---

_AgendaAe Platform — CLAUDE.md v3 — Maio 2026_
_Stack: Next.js 16 + Bun + Drizzle + Postgres na VPS + Better Auth + Resend + Biome + Coolify_
_Sem Supabase · Sem Docker em dev · Postgres via Homebrew localmente_
