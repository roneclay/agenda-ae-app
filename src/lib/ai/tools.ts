import type Anthropic from '@anthropic-ai/sdk'

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_services',
    description: 'Lista os serviços disponíveis com preço e duração',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'check_availability',
    description:
      'Verifica horários disponíveis para uma lista de serviços em uma data. Retorna slots disponíveis, parciais e próxima data com slot completo.',
    input_schema: {
      type: 'object',
      properties: {
        service_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs dos serviços selecionados',
        },
        date: { type: 'string', description: 'YYYY-MM-DD' },
      },
      required: ['service_ids', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Agenda um ou mais serviços. SEMPRE chame check_availability antes.',
    input_schema: {
      type: 'object',
      properties: {
        service_ids: { type: 'array', items: { type: 'string' } },
        scheduled_at: { type: 'string', description: 'ISO 8601 com timezone' },
        customer_name: { type: 'string' },
        customer_email: {
          type: 'string',
          description: 'opcional — para enviar confirmação por email',
        },
      },
      required: ['service_ids', 'scheduled_at'],
    },
  },
  {
    name: 'list_my_appointments',
    description: 'Lista os próximos agendamentos do cliente',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancela um agendamento existente',
    input_schema: {
      type: 'object',
      properties: { appointment_id: { type: 'string' } },
      required: ['appointment_id'],
    },
  },
]

export const AGENT_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 300,
  temperature: 0.3,
  max_tool_iterations: 5,
} as const
