import { describe, expect, test } from 'bun:test'
import { professionalJsonLd } from '@/lib/structured-data'

describe('professionalJsonLd', () => {
  const base = { url: 'https://www.agendadinho.com.br/agendar/ana', name: 'Ana', bio: null }

  test('declares the page as a ProfessionalService with its own URL', () => {
    const ld = professionalJsonLd({ ...base, services: [] })
    expect(ld['@type']).toBe('ProfessionalService')
    expect(ld.url).toBe(base.url)
    expect(ld['@id']).toBe(`${base.url}#business`)
  })

  test('formats prices in BRL from cents and keeps service names', () => {
    const ld = professionalJsonLd({
      ...base,
      services: [
        { name: 'Corte', description: null, priceCents: 4900 },
        { name: 'Barba', description: 'Com toalha quente', priceCents: 2550 },
      ],
    })
    expect(ld.makesOffer.map((o) => [o.itemOffered.name, o.price, o.priceCurrency])).toEqual([
      ['Corte', '49.00', 'BRL'],
      ['Barba', '25.50', 'BRL'],
    ])
    expect(ld.makesOffer[1].itemOffered.description).toBe('Com toalha quente')
  })

  test('only exposes name, bio and services (no phone, address or photo)', () => {
    const ld = professionalJsonLd({ ...base, bio: 'Cabeleireira', services: [] })
    expect(Object.keys(ld).sort()).toEqual(
      ['@context', '@id', '@type', 'description', 'makesOffer', 'name', 'url'].sort(),
    )
    expect(ld.description).toBe('Cabeleireira')
  })
})
