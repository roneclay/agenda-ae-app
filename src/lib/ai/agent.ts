import Anthropic from '@anthropic-ai/sdk'
import { and, desc, eq } from 'drizzle-orm'
import { conversation, customer, db, message, type professional } from '@/lib/db'
import { NICHES } from '@/lib/config/niches'
import { mockAgentResponse } from './mock'
import { AGENT_CONFIG, AGENT_TOOLS } from './tools'
import { executeTool } from './tools-executor'

type Pro = typeof professional.$inferSelect
type Customer = typeof customer.$inferSelect

const MOCK = process.env.AI_MOCK === 'true'

export type AgentReply = {
  reply: string
  toolCalls: Array<{ name: string; input: unknown; result: unknown }>
}

export async function runAgent({
  pro,
  cust,
  userMessage,
}: {
  pro: Pro
  cust: Customer
  userMessage: string
}): Promise<AgentReply> {
  // Load or create conversation
  const [existing] = await db
    .select()
    .from(conversation)
    .where(and(eq(conversation.professionalId, pro.id), eq(conversation.customerId, cust.id)))
    .limit(1)

  let conv = existing
  if (!conv) {
    const [created] = await db
      .insert(conversation)
      .values({ professionalId: pro.id, customerId: cust.id, lastMessageAt: new Date() })
      .returning()
    conv = created
  }

  await db.insert(message).values({
    conversationId: conv.id,
    role: 'user',
    content: userMessage,
  })

  if (MOCK) {
    const reply = mockAgentResponse(userMessage)
    await db.insert(message).values({
      conversationId: conv.id,
      role: 'assistant',
      content: reply,
    })
    return { reply, toolCalls: [] }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const reply =
      'Desculpe, o assistente está indisponível no momento. Entre em contato direto com a profissional.'
    return { reply, toolCalls: [] }
  }

  const client = new Anthropic({ apiKey })
  const niche = NICHES[pro.niche]

  const history = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conv.id))
    .orderBy(desc(message.createdAt))
    .limit(20)

  const messages: Anthropic.MessageParam[] = history
    .reverse()
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content ?? '',
    }))

  const system = `Você é o assistente de agendamento de ${pro.name} (${niche.professionalNoun}).
Tom: ${niche.reminderTone}. Atende ${niche.customerNoun}s no nicho ${pro.niche}.
SEMPRE chame check_availability antes de book_appointment.
Confirme dados antes de agendar. Responda em pt-BR, curto e direto.`

  const toolCalls: AgentReply['toolCalls'] = []
  let lastText = ''

  for (let i = 0; i < AGENT_CONFIG.max_tool_iterations; i++) {
    const res = await client.messages.create({
      model: AGENT_CONFIG.model,
      max_tokens: AGENT_CONFIG.max_tokens,
      temperature: AGENT_CONFIG.temperature,
      system,
      tools: AGENT_TOOLS,
      messages,
    })

    const textBlocks = res.content.filter((b) => b.type === 'text')
    const toolUses = res.content.filter((b) => b.type === 'tool_use')

    if (textBlocks.length > 0) {
      lastText = textBlocks.map((b) => (b as Anthropic.TextBlock).text).join('\n')
    }

    if (toolUses.length === 0 || res.stop_reason !== 'tool_use') break

    messages.push({ role: 'assistant', content: res.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const tu of toolUses) {
      const block = tu as Anthropic.ToolUseBlock
      const result = await executeTool(
        { pro, customer: cust },
        block.name,
        (block.input as Record<string, unknown>) ?? {},
      )
      toolCalls.push({ name: block.name, input: block.input, result })
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      })
    }
    messages.push({ role: 'user', content: toolResults })
  }

  await db.insert(message).values({
    conversationId: conv.id,
    role: 'assistant',
    content: lastText,
    toolCalls: toolCalls.length > 0 ? JSON.stringify(toolCalls) : null,
  })

  return { reply: lastText, toolCalls }
}
