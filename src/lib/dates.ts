const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
export type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000

export function todayInBRT(): string {
  const now = new Date()
  const brt = new Date(now.getTime() - BRT_OFFSET_MS)
  return `${brt.getUTCFullYear()}-${String(brt.getUTCMonth() + 1).padStart(2, '0')}-${String(brt.getUTCDate()).padStart(2, '0')}`
}

export function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d) + n * 86400000
  const dt = new Date(ms)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

export function dayKeyFor(isoDate: string): DayKey {
  const [y, m, d] = isoDate.split('-').map(Number)
  const utcDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return DAY_KEYS[utcDow] as DayKey
}

export function nextNDates(n: number, fromIso?: string): string[] {
  const start = fromIso ?? todayInBRT()
  return Array.from({ length: n }, (_, i) => addDays(start, i))
}

const PT_DAY_LABELS: Record<DayKey, string> = {
  MON: 'Segunda',
  TUE: 'Terça',
  WED: 'Quarta',
  THU: 'Quinta',
  FRI: 'Sexta',
  SAT: 'Sábado',
  SUN: 'Domingo',
}

const PT_DAY_LABELS_SHORT: Record<DayKey, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
}

export function dayLabel(key: DayKey, short = false): string {
  return short ? PT_DAY_LABELS_SHORT[key] : PT_DAY_LABELS[key]
}

export function formatBrDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  })
}

export const DAY_KEYS_ORDER: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
