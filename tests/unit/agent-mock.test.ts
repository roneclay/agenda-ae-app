import { describe, expect, test } from 'bun:test'
import { mockAgentResponse } from '@/lib/ai/mock'

describe('mockAgentResponse', () => {
  test('responde sobre agendamento', () => {
    expect(mockAgentResponse('quero agendar')).toContain('atendimento')
  })
  test('responde sobre preço', () => {
    expect(mockAgentResponse('qual o preço?')).toContain('R$')
  })
  test('responde sobre disponibilidade', () => {
    expect(mockAgentResponse('tem vaga?')).toContain('horários')
  })
  test('tem resposta padrão', () => {
    expect(mockAgentResponse('oi').length).toBeGreaterThan(10)
  })
})
