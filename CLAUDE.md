# AgendaAe — CLAUDE.md

> SaaS de agendamento online multi-nicho (bot de WhatsApp é visão futura, fora do escopo do v1 — ver seção PRODUTO) · Next.js 16 + Bun · Vercel + Neon · sem Supabase, sem Docker em dev.

---

## PRODUTO

Motor único deployado em múltiplos domínios/nichos: **beauty, legal, petcare, fitness**.

**Fluxo principal:**
1. Profissional cadastra → confirma email → onboarding (dados + 1 serviço + horários → link público ativa)
2. Link público `/agendar/[slug]` — sem login, wizard 4 etapas: serviços → horário → dados → confirmação
3. **V1 não tem bot de WhatsApp/chat** — só agenda online (link público). O código do bot (Claude Haiku) existe mas está fora do escopo de lançamento por decisão de produto.
4. Lembretes automáticos 24h, 6h e 2h antes (WhatsApp + email). No lembrete de 6h, pede confirmação de presença via link público (`/confirmar/[id]`) — se não confirmar até 2h antes, cancela automaticamente e libera o horário (avisa o profissional por e-mail).
5. Profissional paga via **Mercado Pago** (Pix e cartão)

---

## STACK — não alterar sem motivo explícito

| Camada | Tecnologia | Onde |
|--------|-----------|------|
| Runtime | **Bun** | |
| Framework | **Next.js 16** (App Router) | |
| ORM | **Drizzle ORM** | `src/lib/db/schema.ts` |
| Auth | **Better Auth** | `src/lib/auth/index.ts` |
| Email | **Resend + React Email** | `src/lib/email/` |
| UI | **shadcn/ui** + Tailwind v4 | |
| Lint/Format | **Biome** | |
| IA | **Claude Haiku** (`claude-haiku-4-5-20251001`) | `src/lib/ai/` (não usado no v1 — sem bot) |
| Pagamento | **Mercado Pago** (Pix e cartão) | `src/lib/mercadopago.ts` |
| Deploy | **Vercel** | main=prod |

**Não usamos:** Supabase, Docker em dev, NextAuth, Prisma.

---

## MULTI-NICHO

- `src/lib/config/niches.ts` — fonte única de verdade para copy, cores, preços e serviços padrão
- Nicho detectado pelo host em prod; forçado por `NICHE=` em dev
- **Nunca** hardcodar strings ou cores de nicho fora de `niches.ts`

**Design system (referência: `agendadinho`):** ink `#0B1220` · bg `#FFFFFF` · bg-soft `#F6F8FB` · linhas `#E5E9F0` · acentos verde `#16C47F` / âmbar `#FFB444` / rosa `#FF6FA8` · fonte Plus Jakarta Sans (mono: JetBrains Mono) · radius 16/24/32px. `--primary` é dinâmico por nicho (ver `NicheConfig.palette` em `niches.ts`, injetado via CSS vars em `layout.tsx`). Paleta beauty: primary `#C85C30`. **Nota:** os emails ainda usam a paleta antiga (ink `#1A0800` · muted `#8A6A58` · bg `#FBF6F0`) — não migrada nesta rodada.

---

## FLAGS DE MOCK (dev)

```env
AI_MOCK=true          # não chama Claude API
WHATSAPP_MOCK=true    # não envia WhatsApp
EMAIL_MOCK=true       # loga no console (inclui URL clicável em verificação/reset)
PAYMENT_MOCK=true     # não processa pagamento
NICHE=beauty          # nicho ativo em dev
```

Verificar cada flag antes de chamar a integração correspondente.

---

## REGRAS DE NEGÓCIO — Agendamento

- Cliente seleciona N serviços; `appointment_service` guarda **snapshot** de preço e duração no momento do booking
- `appointment.duration_minutes` = soma das durações; `appointment.total_cents` = soma dos preços
- **Slots nunca ocultos**: classificar como `available` / `partial` / `unavailable` — slot parcial sugere serviços que cabem + próxima data com slot completo
- Bot de IA nunca diz "não tem horário"
- `/agendar/[slug]` é pública (sem auth); profissional controla `is_accepting_bookings`
- **Onboarding gate**: link público só ativa após dados básicos + 1 serviço + horários configurados
- Dashboard mostra banner amarelo até WhatsApp Business estar conectado
- Modelo de horários: padrão semanal multi-window + overrides por data, 7 dias rolantes para cliente, tudo em BRT

---

## REGRAS ABSOLUTAS

```
✅ UI e mensagens ao usuário: Português do Brasil
✅ Código (tabelas, colunas, funções, variáveis, tipos): Inglês
✅ Preços SEMPRE em centavos no banco — formatar só na UI (R$ 49,00)
✅ Datas SEMPRE ISO 8601 com timezone America/Sao_Paulo
✅ Toda query filtra por professionalId — sem exceção
✅ Validar payloads de API com Zod
✅ Snapshot de preço e duração em appointment_service no momento do booking
✅ Checkout sempre com PIX (AbacatePay) E Cartão (Stripe) — nunca forçar só PIX
✅ CI passa antes de qualquer merge em staging ou main
✅ Mobile-first: toda UI nova funciona bem em celular (profissionais e clientes usam no mobile)
```

---

## COMANDOS DO DIA A DIA

```bash
bun run dev          # localhost:3000
bun run test         # unitários (rodar antes de qualquer commit)
bun run db:push      # aplica schema (dev — sem migration file)
bun run db:generate  # gera migration file (prod)
bun run db:migrate   # aplica migrations (prod)
bun run db:studio    # UI banco localhost:4983
bun run email:dev    # preview emails localhost:3001
bun run typecheck    # TypeScript
bun run lint         # Biome lint
bun run format       # Biome format
bun run test:e2e     # Playwright
bun run test:all     # typecheck + lint + unit + E2E
```

---

## BRANCHES

```
main      ← produção (protegida, só PR de staging)
staging   ← homologação (auto-deploy)
develop   ← integração
feature/* / hotfix/*
```
