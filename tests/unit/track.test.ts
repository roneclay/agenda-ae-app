import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { takePendingEvents, trackCookieName, trackEvent } from '@/lib/track'

const g = globalThis as unknown as { window?: unknown; document?: unknown }

// Jar mínimo: document.cookie lê "a=1; b=1" e aceita "nome=; max-age=0" pra apagar.
function installDom(initial: string[] = []) {
  const jar = new Set(initial)
  g.document = {
    get cookie() {
      return [...jar].map((name) => `${name}=1`).join('; ')
    },
    set cookie(value: string) {
      const [pair] = value.split(';')
      const [name] = pair.split('=')
      if (value.includes('max-age=0')) jar.delete(name.trim())
      else jar.add(name.trim())
    },
  }
  return jar
}

function installWindow(api: { fbq?: unknown; gtag?: unknown } = {}) {
  g.window = api
}

beforeEach(() => {
  installDom()
  installWindow()
})

afterEach(() => {
  delete g.window
  delete g.document
})

describe('trackEvent', () => {
  test('não dá erro sem fbq nem gtag', () => {
    installWindow({})
    expect(() => trackEvent('trial_iniciado')).not.toThrow()
    expect(() => trackEvent('cadastro_completo')).not.toThrow()
  })

  test('não dá erro fora do navegador', () => {
    delete g.window
    expect(() => trackEvent('trial_iniciado')).not.toThrow()
  })

  test('trial_iniciado dispara StartTrial no fbq e trial_iniciado no gtag', () => {
    const fbq: unknown[][] = []
    const gtag: unknown[][] = []
    installWindow({
      fbq: (...args: unknown[]) => fbq.push(args),
      gtag: (...args: unknown[]) => gtag.push(args),
    })
    trackEvent('trial_iniciado')
    expect(fbq).toEqual([['track', 'StartTrial']])
    expect(gtag).toEqual([['event', 'trial_iniciado']])
  })

  test('cadastro_completo dispara CompleteRegistration no fbq e cadastro_completo no gtag', () => {
    const fbq: unknown[][] = []
    const gtag: unknown[][] = []
    installWindow({
      fbq: (...args: unknown[]) => fbq.push(args),
      gtag: (...args: unknown[]) => gtag.push(args),
    })
    trackEvent('cadastro_completo')
    expect(fbq).toEqual([['track', 'CompleteRegistration']])
    expect(gtag).toEqual([['event', 'cadastro_completo']])
  })

  test('funciona só com fbq ou só com gtag', () => {
    const fbq: unknown[][] = []
    installWindow({ fbq: (...args: unknown[]) => fbq.push(args) })
    trackEvent('trial_iniciado')
    expect(fbq).toHaveLength(1)

    const gtag: unknown[][] = []
    installWindow({ gtag: (...args: unknown[]) => gtag.push(args) })
    trackEvent('trial_iniciado')
    expect(gtag).toHaveLength(1)
  })

  test('erro dentro do fbq não propaga', () => {
    installWindow({
      fbq: () => {
        throw new Error('boom')
      },
    })
    expect(() => trackEvent('trial_iniciado')).not.toThrow()
  })
})

describe('takePendingEvents', () => {
  test('sem cookies devolve lista vazia', () => {
    expect(takePendingEvents()).toEqual([])
  })

  test('devolve o evento uma única vez e apaga o cookie', () => {
    const jar = installDom([trackCookieName('trial_iniciado')])
    expect(takePendingEvents()).toEqual(['trial_iniciado'])
    expect(jar.size).toBe(0)
    expect(takePendingEvents()).toEqual([])
  })

  test('só cadastro_completo presente: sai só ele', () => {
    installDom([trackCookieName('cadastro_completo')])
    expect(takePendingEvents()).toEqual(['cadastro_completo'])
  })

  test('os dois cookies ao mesmo tempo saem na ordem trial → cadastro, mesmo gravados ao contrário', () => {
    const jar = installDom([
      trackCookieName('cadastro_completo'),
      trackCookieName('trial_iniciado'),
    ])
    expect(takePendingEvents()).toEqual(['trial_iniciado', 'cadastro_completo'])
    expect(jar.size).toBe(0)
    expect(takePendingEvents()).toEqual([])
  })

  test('ignora cookies que não são de tracking', () => {
    const jar = installDom(['session=abc', trackCookieName('trial_iniciado')])
    expect(takePendingEvents()).toEqual(['trial_iniciado'])
    expect([...jar]).toEqual(['session=abc'])
  })

  test('fora do navegador devolve lista vazia', () => {
    delete g.document
    expect(takePendingEvents()).toEqual([])
  })
})
