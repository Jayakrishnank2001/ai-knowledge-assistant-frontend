'use client'

import React from 'react'
import { X } from 'lucide-react'
import { useEscapeKey } from '@/lib/ui'
import { cn } from '@/lib/utils'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  labelledBy?: string
  wide?: boolean
  dismissable?: boolean
}

export default function Modal({
  title,
  onClose,
  children,
  labelledBy = 'modal-title',
  wide = false,
  dismissable = true,
}: ModalProps) {
  useEscapeKey(dismissable, onClose)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#24103d]/55 p-4 backdrop-blur-sm"
      onClick={() => {
        if (dismissable) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-lg',
          wide ? 'h-full max-h-[92vh] max-w-5xl' : 'mx-4 max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4 sm:p-6">
          <h2 id={labelledBy} className="truncate text-base font-semibold text-gray-900 sm:text-lg">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={!dismissable}
            aria-label="Close"
            className="rounded p-1 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="size-5 text-gray-600" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
