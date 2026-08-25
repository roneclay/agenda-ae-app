import { beforeAll, describe, expect, test } from 'bun:test'

describe('Email send (mock mode)', () => {
  beforeAll(() => {
    process.env.EMAIL_MOCK = 'true'
  })

  test('sendBoasVindas não lança erro', async () => {
    const { sendBoasVindas } = await import('@/lib/email/send')
    const result = await sendBoasVindas({ to: 'test@test.com', name: 'Teste' })
    expect(result).toBeDefined()
  })

  test('sendVerificationEmail não lança erro', async () => {
    const { sendVerificationEmail } = await import('@/lib/email/send')
    const result = await sendVerificationEmail({
      to: 'test@test.com',
      name: 'Teste',
      url: 'http://localhost:3000/verificar',
    })
    expect(result).toBeDefined()
  })
})
