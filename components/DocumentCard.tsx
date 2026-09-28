'use client'

import React from 'react'
import { Eye, FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentCardProps {
  fileName: string
  fileSize: string
  status: 'completed' | 'processing' | 'failed'
  uploadedAt: string
  onPreview?: () => void
  onDelete?: () => void
}

export default function DocumentCard({
  fileName,
  fileSize,
  status,
  uploadedAt,
  onPreview,
  onDelete,
}: DocumentCardProps) {
  const statusConfig = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    processing: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Processing',
    },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  }

  const config = statusConfig[status]

  // The whole row opens the preview, so it also has to be reachable by keyboard.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onPreview) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onPreview()
    }
  }

  return (
    <div
      role={onPreview ? 'button' : undefined}
      tabIndex={onPreview ? 0 : undefined}
      onClick={onPreview}
      onKeyDown={handleKeyDown}
      title={onPreview ? `Preview ${fileName}` : undefined}
      aria-label={onPreview ? `Preview ${fileName}` : undefined}
      className={cn(
        'group flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors',
        onPreview &&
          'cursor-pointer hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b6aff]/40'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>
        {onPreview && (
          <span
            aria-hidden="true"
            className="hidden sm:grid size-6 shrink-0 place-items-center rounded-full text-[#5517dd] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Eye className="w-4 h-4" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            config.bg,
            config.text
          )}
        >
          {config.label}
        </div>
        <p className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">{uploadedAt}</p>
        {onDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            aria-label={`Delete ${fileName}`}
            title="Delete document"
            className="hidden sm:block p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  )
}
