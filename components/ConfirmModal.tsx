'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
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
  // Escape closes the dialog (unless an action is already in flight).
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, busy, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#24103d]/55 backdrop-blur-sm"
      onClick={() => {
        if (!busy) onClose()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="mx-4 w-full max-w-md rounded-lg bg-white shadow-lg"
      >
        {/* Header - mirrors UploadModal */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
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
      </div>
    </div>
  )
}