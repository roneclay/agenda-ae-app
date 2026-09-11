import { getTranslations } from 'next-intl/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SECTIONS = [
  { key: 'primeirosPassos', items: ['q1', 'q2', 'q3'] },
  { key: 'comoClienteAgenda', items: ['q1', 'q2', 'q3'] },
  { key: 'lembretes', items: ['q1', 'q2', 'q3'] },
  { key: 'gerenciarAgenda', items: ['q1', 'q2', 'q3', 'q4'] },
  { key: 'pagamento', items: ['q1', 'q2', 'q3'] },
  { key: 'semPagar', items: ['q1', 'q2', 'q3'] },
] as const

export async function AjudaContent({ showHeading = true }: { showHeading?: boolean } = {}) {
  const t = await getTranslations('dashboard.ajuda')

  return (
    <div className="space-y-6">
      {showHeading && (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      )}

      <div className="space-y-4">
        {SECTIONS.map(({ key: sectionKey, items }) => (
          <Card key={sectionKey}>
            <CardHeader>
              <CardTitle>{t(`sections.${sectionKey}.title`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion>
                {items.map((itemKey) => (
                  <AccordionItem key={itemKey} value={`${sectionKey}-${itemKey}`}>
                    <AccordionTrigger>
                      {t(`sections.${sectionKey}.items.${itemKey}.question`)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">
                        {t(`sections.${sectionKey}.items.${itemKey}.answer`)}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
