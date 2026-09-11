import { getTranslations } from 'next-intl/server'
import { SUPPORT_EMAIL } from '@/lib/config/niches'

// TODO: rascunho gerado pra destravar o cadastro — precisa de revisão por
// advogado especializado em LGPD antes de valer como termo vinculante.
const SECTION_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'] as const

export async function TermosContent() {
  const t = await getTranslations('legal')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('updatedAt')}</p>
      </div>

      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {t('disclaimer')}
      </div>

      <div className="space-y-6">
        {SECTION_KEYS.map((key) => {
          const paragraphs = t.raw(`sections.${key}.paragraphs`) as string[]
          return (
            <div key={key}>
              <h2 className="text-lg font-bold text-foreground">{t(`sections.${key}.title`)}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {paragraphs.map((p, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: lista estática, não reordena
                  <p key={i}>{p.replace('{supportEmail}', SUPPORT_EMAIL)}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
