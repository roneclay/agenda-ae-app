import { describe, expect, test } from 'bun:test'
import { getNicheFromHost, NICHES } from '@/lib/config/niches'

describe('NICHES config', () => {
  test('todos os nichos têm campos obrigatórios', () => {
    for (const [key, config] of Object.entries(NICHES)) {
      expect(config.niche).toBe(key as never)
      expect(config.primaryColor).toMatch(/^#[0-9A-F]{6}$/i)
      expect(config.appointmentNoun).toBeTruthy()
      expect(config.proPriceCents).toBeGreaterThan(0)
    }
  })

  test('getNicheFromHost retorna beauty como fallback em produção', () => {
    const env = process.env as Record<string, string | undefined>
    const original = env.NODE_ENV
    env.NODE_ENV = 'production'
    expect(getNicheFromHost('desconhecido.com.br').niche).toBe('beauty')
    env.NODE_ENV = original
  })

  test('detecta nicho legal pelo domínio', () => {
    const env = process.env as Record<string, string | undefined>
    const original = env.NODE_ENV
    env.NODE_ENV = 'production'
    expect(getNicheFromHost('agendaadv.com.br').niche).toBe('legal')
    env.NODE_ENV = original
  })
})
