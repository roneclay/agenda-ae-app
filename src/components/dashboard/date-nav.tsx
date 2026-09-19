'use client'

import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ptBR } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function DateNav({ date, label }: { date: string; label: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [year, month, day] = date.split('-').map(Number)
  const selected = new Date(year, month - 1, day)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 px-2 text-muted-foreground hover:text-foreground"
          />
        }
      >
        <CalendarIcon className="size-4" />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          onSelect={(d) => {
            if (!d) return
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            setOpen(false)
            router.push(`/dashboard?date=${iso}`)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
