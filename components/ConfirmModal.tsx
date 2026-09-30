'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <Modal title={title} onClose={onClose} dismissable={!busy} labelledBy="confirm-modal-title">
      <div className="p-6">
        <div className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50">
            <AlertTriangle className="size-5 text-red-600" />
          </span>
          <p className="pt-1.5 text-sm leading-6 text-[#554e61]">{message}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={busy} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}