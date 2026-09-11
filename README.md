# AgendaAe / Agendadinho

SaaS de agendamento online para profissionais autônomos (beleza, jurídico, pet care, fitness). Link público sem login pro cliente marcar horário, lembretes automáticos por e-mail, confirmação de presença e assinatura via Mercado Pago (Pix ou cartão).

Next.js 16 + Bun + Drizzle ORM + Postgres. Ver `CLAUDE.md` pra detalhes completos de produto, stack, regras de negócio e comandos do dia a dia — este README é só o essencial pra rodar localmente.

## Rodando localmente

```bash
bun install
cp .env.example .env.local   # preencher DATABASE_URL, RESEND_API_KEY etc.
bun run db:push              # aplica o schema no Postgres local
bun run dev                  # localhost:3000
```

Flags de mock úteis em dev (`.env.local`): `AI_MOCK`, `WHATSAPP_MOCK`, `EMAIL_MOCK`, `PAYMENT_MOCK` — evitam chamar as integrações externas de verdade.

## Comandos principais

```bash
bun run test:all     # typecheck + lint + unit + E2E
bun run db:studio    # UI do banco em localhost:4983
bun run email:dev    # preview dos e-mails transacionais em localhost:3001
```

Lista completa em `CLAUDE.md`.
