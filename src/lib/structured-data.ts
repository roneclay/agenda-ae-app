type JsonLdService = { name: string; description: string | null; priceCents: number }

/**
 * schema.org ProfessionalService for the public booking page. Only fields the page already
 * shows publicly (name, bio, active services with price): no phone, address or photo.
 */
export function professionalJsonLd({
  url,
  name,
  bio,
  services,
}: {
  url: string
  name: string
  bio: string | null
  services: JsonLdService[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${url}#business`,
    name,
    url,
    description: bio ?? undefined,
    makesOffer: services.map((s) => ({
      '@type': 'Offer',
      price: (s.priceCents / 100).toFixed(2),
      priceCurrency: 'BRL',
      itemOffered: { '@type': 'Service', name: s.name, description: s.description ?? undefined },
    })),
  }
}
