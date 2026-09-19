'use client'

import React from 'react'
import { MoreVertical, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  description?: string
  showUploadButton?: boolean
  onUpload?: () => void
  compact?: boolean
}

export default function Header({
  title,
  description,
  showUploadButton = false,
  onUpload,
  compact = false,
}: HeaderProps) {
  return (
    <div className={`shrink-0 border-b border-gray-200 bg-white ${compact ? 'px-6 py-3 md:pr-10' : 'px-8 py-6'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showUploadButton && (
            <Button onClick={onUpload} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload PDF
            </Button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
