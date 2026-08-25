'use client'

import { useActionState, useState } from 'react'
import {
  buildDefaultWeeklyState,
  flattenForSubmit,
  WeeklyScheduleEditor,
  type WeeklyState,
} from '@/components/schedule/weekly-schedule-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { type ScheduleState, saveSchedule } from './actions'

export function HoursStep() {
  const [state, action, pending] = useActionState<ScheduleState, FormData>(saveSchedule, {})
  const [weekly, setWeekly] = useState<WeeklyState>(() => buildDefaultWeeklyState())

  const flattened = flattenForSubmit(weekly)
  const noWindows = flattened.length === 0

  return (
    <Card>
      <form action={action}>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Defina seu padrão semanal. Isso se repete toda semana — depois você pode ajustar dias
            específicos pelo dashboard.
          </p>

          <input type="hidden" name="payload" value={JSON.stringify({ windows: flattened })} />
          <WeeklyScheduleEditor initial={weekly} onChange={setWeekly} />

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending || noWindows}>
            {pending ? 'Ativando agenda...' : 'Concluir e ativar minha agenda'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
