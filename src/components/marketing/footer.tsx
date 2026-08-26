import Image from 'next/image'
import Link from 'next/link'
import type { NicheConfig } from '@/lib/config/niches'
import { NAV_LINKS } from './nav'

export function MarketingFooter({ niche }: { niche: NicheConfig }) {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              {niche.logoUrl && (
                <Image src={niche.logoUrl} alt="" width={28} height={28} className="rounded-lg" />
              )}
              <p className="text-xl font-extrabold text-foreground">{niche.brandName}</p>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A agenda que trabalha enquanto você atende. Feito no Brasil pra quem vive de
              atendimento.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Produto</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Conta</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Entrar
                </Link>
              </li>
              <li>
                <Link href="/cadastro" className="hover:text-foreground">
                  Criar conta
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {niche.brandName} — feito no Brasil 🇧🇷
        </div>
      </div>
    </footer>
  )
}
