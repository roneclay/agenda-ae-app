import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/utils'

export async function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const t = await getTranslations('onboarding.stepper')
  const STEPS = [
    { n: 1 as const, label: t('basics') },
    { n: 2 as const, label: t('firstService') },
    { n: 3 as const, label: t('hours') },
  ]

  return (
    <ol className="flex items-center justify-between gap-2 text-xs">
      {STEPS.map((s, i) => {
        const done = current > s.n
        const active = current === s.n
        return (
          <li key={s.n} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary text-primary',
                !done && !active && 'border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {done ? '✓' : s.n}
            </span>
            <span
              className={cn(
                'truncate',
                active ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="ml-1 hidden h-px flex-1 bg-muted-foreground/20 sm:block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
