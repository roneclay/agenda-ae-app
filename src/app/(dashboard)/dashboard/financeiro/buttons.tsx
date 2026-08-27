'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PIX_RECEIVER_LEGAL_NAME } from '@/lib/config/niches'
import { cancelSubscription, checkPixPayment, createCheckout, createPixCheckout } from './actions'

export function ActivateProButton({ priceLabel }: { priceLabel: string }) {
  const t = useTranslations('financeiro')
  const [pending, start] = useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await createCheckout()
          if (result.error) {
            toast.error(result.error)
            return
          }
          if (result.url) window.location.href = result.url
        })
      }
    >
      {pending ? t('redirecting') : t('cardButton', { price: priceLabel })}
    </Button>
  )
}

export function PixCheckoutButton({ priceLabel }: { priceLabel: string }) {
  const t = useTranslations('financeiro')
  const [pending, start] = useTransition()
  const [checking, startCheck] = useTransition()
  const [pix, setPix] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null)

  useEffect(() => {
    if (!pix) return
    let cancelled = false
    const interval = setInterval(async () => {
      const result = await checkPixPayment()
      if (cancelled) return
      if (result.paid) {
        clearInterval(interval)
        toast.success(t('pixPaid'))
        window.location.reload()
      }
    }, 4000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pix, t])

  if (pix) {
    return (
      <div className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-medium">{t('pixTitle')}</p>
        <p className="text-xs text-muted-foreground">
          {t.rich('pixNameNotice', {
            name: PIX_RECEIVER_LEGAL_NAME,
            b: (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
        {pix.qrCodeBase64 && (
          // biome-ignore lint/performance/noImgElement: data URI (QR base64), next/image não otimiza isso
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR code Pix"
            className="mx-auto h-48 w-48"
          />
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            navigator.clipboard.writeText(pix.qrCode)
            toast.success(t('pixCopied'))
          }}
        >
          {t('pixCopyButton')}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t('pixAutoChecking')}</p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={checking}
          onClick={() =>
            startCheck(async () => {
              const result = await checkPixPayment()
              if (result.paid) {
                toast.success(t('pixPaid'))
                window.location.reload()
              } else {
                toast.error(t('pixNotPaidYet'))
              }
            })
          }
        >
          {checking ? t('pixChecking') : t('pixCheckButton')}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await createPixCheckout()
          if (result.error) {
            toast.error(result.error)
            return
          }
          if (result.qrCode)
            setPix({ qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64 ?? '' })
        })
      }
    >
      {pending ? t('generatingPix') : t('pixButton', { price: priceLabel })}
    </Button>
  )
}

export function CancelSubButton() {
  const t = useTranslations('financeiro')
  const [pending, start] = useTransition()
  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm(t('cancelConfirm'))) return
        start(async () => {
          await cancelSubscription()
          toast.success(t('cancelSuccess'))
        })
      }}
    >
      {t('cancelButton')}
    </Button>
  )
}
