# Agendadinho — briefing pra marketing

> Este documento é pra dar contexto de produto/negócio (pro Claude web ou qualquer ferramenta de marketing) — não é documentação técnica. Se precisar de detalhes de código, use o README/CLAUDE.md do repositório.

## O que é

**Agendadinho** ([agendadinho.com.br](https://agendadinho.com.br)) é um sistema de agendamento online pra profissionais autônomos da área de **beleza**: cabeleireiro(a), barbeiro(a), manicure, esteticista, lash designer, sobrancelhas, maquiador(a).

O profissional recebe um **link público** (ex: `agendadinho.com.br/agendar/seu-nome`) que ele compartilha com os clientes. O cliente agenda sozinho — sem baixar app, sem criar conta, sem trocar mensagem no WhatsApp pra combinar horário.

## O problema que resolve

Hoje esses profissionais organizam a agenda trocando mensagem no WhatsApp: "que horas você tem vago?", cliente confirma e depois não aparece (no-show), o profissional vira recepcionista + atendente ao mesmo tempo, perde tempo e dinheiro com horário furado.

## Como resolve

- **Link público de agendamento** — cliente escolhe serviço, vê os horários disponíveis de verdade e agenda sozinho.
- **Lembretes automáticos** 24h, 6h e 2h antes do horário (WhatsApp + e-mail).
- **Confirmação de presença** — no lembrete de 6h, pede pro cliente confirmar; se não confirmar até 2h antes, cancela automaticamente e libera o horário pra outra pessoa.
- **Controle de horários** — janelas semanais + bloqueios/exceções por data específica.
- Nunca mostra "sem horário" pro cliente — sempre sugere a alternativa mais próxima.

## Preço e oferta

- **Plano único**: R$ 29,90/mês, tudo incluso (sem taxa de adesão, sem plano "básico/avançado").
- **14 dias grátis, sem cartão de crédito** — testa de verdade antes de decidir.
- Pagamento via Mercado Pago (Pix ou cartão) depois do trial.

## Estágio atual (2026-09-17)

- **Em produção**, recebendo cadastros reais.
- Cadastro com e-mail e WhatsApp exigidos, ambos únicos por conta (não dá pra criar conta duplicada pra ficar reiniciando o trial).
- Onboarding: dados básicos → primeiro serviço → horários → link fica ativo.
- Dashboard com banner até o profissional conectar o próprio WhatsApp Business (fora isso, o produto já funciona sem essa conexão — lembrete por e-mail funciona desde já).

## Tom de voz

Direto, informal, brasileiro — sem jargão corporativo. Fala com quem "vive de atendimento" (a peça de copy central), não com "gestores" ou "empreendedores". Exemplos reais de copy do site:

- "Chega de perder atendimento por cliente que sumiu."
- "Não é mais um sistema pra aprender. É o fim da rotina de ficar trocando mensagem pra combinar horário."
- "Sem cartão · Sem complicação · Em poucos minutos"

## Público-alvo

Profissional autônomo ou pequeno salão/barbearia, sem equipe de TI, que hoje agenda por WhatsApp/caderno e sente a dor do no-show e da troca de mensagem. Não é um público que quer "sistema de gestão completo" — quer resolver uma dor específica rápido.

## O que NÃO usar na comunicação

- Não mencionar "multi-nicho", "outros nichos" ou verticais como jurídico/pet/fitness — o produto público é 100% beleza, ponto. (A base de código é reaproveitável pra outros nichos no futuro, mas isso é um detalhe técnico interno, não é um atributo do produto atual.)
- Não afirmar que o WhatsApp é "verificado por SMS" — hoje só garantimos que é único por conta, não que passou por confirmação via código.
- Bot de WhatsApp/IA conversacional: existe no código mas está **fora do escopo do lançamento** — não comunicar como recurso disponível.
