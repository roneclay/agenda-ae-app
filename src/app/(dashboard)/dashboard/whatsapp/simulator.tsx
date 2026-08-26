'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Msg = { role: 'user' | 'assistant'; content: string; tools?: unknown[] }

export function WhatsAppSimulator({ slug }: { slug: string }) {
  const [whatsappId, setWhatsappId] = useState('+5548911112222')
  const [name, setName] = useState('João Cliente')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim()) return
    const userMsg: Msg = { role: 'user', content: input }
    setHistory((h) => [...h, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/whatsapp/simulate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, whatsappId, customerName: name, message: userMsg.content }),
    })

    setLoading(false)
    if (!res.ok) {
      toast.error('Erro ao enviar')
      return
    }
    const data = (await res.json()) as { reply: string; toolCalls: unknown[] }
    setHistory((h) => [...h, { role: 'assistant', content: data.reply, tools: data.toolCalls }])
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="wid">Cliente WhatsApp</Label>
          <Input id="wid" value={whatsappId} onChange={(e) => setWhatsappId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cname">Nome (1ª vez)</Label>
          <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <div className="h-80 space-y-2 overflow-y-auto rounded-xl border bg-muted/30 p-4">
        {history.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Mande uma mensagem como se fosse o cliente: "quero agendar unhas amanhã às 10h".
          </p>
        )}
        {history.map((m, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: lista imutável de histórico
            key={i}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.role === 'user' ? 'ml-auto bg-foreground text-background' : 'bg-background border'
            }`}
          >
            {m.content || <em className="text-muted-foreground">(sem texto)</em>}
            {m.tools && m.tools.length > 0 && (
              <details className="mt-2 text-xs opacity-70">
                <summary>Tool calls ({m.tools.length})</summary>
                <pre className="mt-1 whitespace-pre-wrap break-all">
                  {JSON.stringify(m.tools, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? '...' : 'Enviar'}
        </Button>
      </form>
    </div>
  )
}
