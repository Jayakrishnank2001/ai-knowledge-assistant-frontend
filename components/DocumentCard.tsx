'use client'

import React from 'react'
import { FileText, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentCardProps {
  fileName: string
  fileSize: string
  status: 'completed' | 'processing' | 'failed'
  uploadedAt: string
}

export default function DocumentCard({
  fileName,
  fileSize,
  status,
  uploadedAt,
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

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">{fileSize}</p>
        </div>
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
        <button className="hidden sm:block p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
