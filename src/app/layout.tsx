import type { Metadata } from 'next'
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from '@/components/ui/sonner'
import { getNicheFromHost } from '@/lib/config/niches'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const title = `${niche.brandName} — Agenda online para quem vive de atendimento`
  const description = `${niche.brandName} organiza sua agenda, confirma presença e envia lembrete automático. Link público de agendamento, sem complicação.`

  return {
    metadataBase: new URL(APP_URL),
    title,
    description,
    alternates: { canonical: '/' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: niche.brandName,
      url: '/',
      title,
      description,
      images: niche.logoUrl ? ['/og-agendadinho.jpg'] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: niche.logoUrl ? ['/og-agendadinho.jpg'] : [],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const niche = getNicheFromHost(headersList.get('host') ?? '')
  const brandStyle = {
    '--primary': niche.palette.base,
    '--primary-foreground': '#ffffff',
    '--accent': niche.palette.tint100,
    '--accent-foreground': niche.palette.darker,
    '--ring': niche.palette.base,
  } as React.CSSProperties

  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      style={brandStyle}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          {children}
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
