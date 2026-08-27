import { describe, expect, test } from 'bun:test'
import { normalizePhone } from '@/lib/phone'

describe('normalizePhone', () => {
  test('remove formatação e mantém só dígitos', () => {
    expect(normalizePhone('+55 (48) 99999-0000')).toBe('5548999990000')
  })

  test('dois números equivalentes com formatação diferente normalizam igual', () => {
    expect(normalizePhone('55 48 99999-0000')).toBe(normalizePhone('+5548999990000'))
  })

  test('string já limpa permanece igual', () => {
    expect(normalizePhone('5548999990000')).toBe('5548999990000')
  })
})
