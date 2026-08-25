'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveServices } from './actions'

type ServiceRow = { id: number; name: string; priceReais: string; durationMinutes: string }

const newRow = (id: number): ServiceRow => ({ id, name: '', priceReais: '', durationMinutes: '60' })

export function ServiceStep() {
  const [rows, setRows] = useState<ServiceRow[]>([newRow(1)])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function update(id: number, field: keyof ServiceRow, value: string) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  function addRow() {
    setRows((r) => [...r, newRow(Date.now())])
  }

  function removeRow(id: number) {
    if (rows.length === 1) return
    setRows((r) => r.filter((row) => row.id !== id))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const valid = rows.every((r) => r.name.trim() && r.priceReais && r.durationMinutes)
    if (!valid) {
      setError('Preencha todos os campos antes de continuar.')
      return
    }

    setPending(true)
    const result = await saveServices(rows.map((r) => ({
      name: r.name.trim(),
      priceReais: r.priceReais,
      durationMinutes: Number(r.durationMinutes),
    })))
    setPending(false)

    if (result?.error) setError(result.error)
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            Cadastre seus serviços. Você pode adicionar ou editar mais depois em{' '}
            <span className="font-medium text-foreground">Serviços</span>.
          </p>

          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={row.id} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Serviço {i + 1}</span>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(row.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Nome do serviço</Label>
                  <Input
                    required
                    placeholder="Ex: Unhas em gel"
                    value={row.name}
                    onChange={(e) => update(row.id, 'name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      required
                      placeholder="80,00"
                      inputMode="decimal"
                      value={row.priceReais}
                      onChange={(e) => update(row.id, 'priceReais', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input
                      required
                      type="number"
                      min={5}
                      max={600}
                      value={row.durationMinutes}
                      onChange={(e) => update(row.id, 'durationMinutes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar serviço
          </button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Salvando...' : 'Continuar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
