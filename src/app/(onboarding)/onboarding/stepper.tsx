import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Dados básicos' },
  { n: 2, label: 'Primeiro serviço' },
  { n: 3, label: 'Horários' },
]

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
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
