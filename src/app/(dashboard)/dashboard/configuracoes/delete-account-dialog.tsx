'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signOut } from '@/lib/auth/client'
import { deleteAccount } from './actions'

const CONFIRM_WORD = 'EXCLUIR'

export function DeleteAccountDialog() {
  const t = useTranslations('dashboard.configuracoes')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [pending, startTransition] = useTransition()

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteAccount()
      if (result.error) {
        toast.error(result.error)
        return
      }
      await signOut()
      toast.success(t('deleteAccountSuccess'))
      router.push('/')
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setConfirmText('')
      }}
    >
      <DialogTrigger render={<Button variant="destructive" />}>
        {t('deleteAccountButton')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteAccountDialogTitle')}</DialogTitle>
          <DialogDescription>{t('deleteAccountDialogDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm-delete">
            {t('deleteAccountConfirmLabel', { word: CONFIRM_WORD })}
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={confirmText !== CONFIRM_WORD || pending}
            onClick={onConfirm}
          >
            {pending ? t('deleteAccountDeleting') : t('deleteAccountConfirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
