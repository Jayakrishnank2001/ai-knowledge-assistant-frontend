'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'

interface ConversationItemProps {
  title: string
  preview: string
  date: string
  onClick?: () => void
  onDelete?: () => void
  deleting?: boolean
}

export default function ConversationItem({
  title,
  preview,
  date,
  onClick,
  onDelete,
  deleting = false,
}: ConversationItemProps) {
  return (
    <div className="flex items-stretch border-b border-gray-200 last:border-b-0 transition-colors group">
      <button
        onClick={onClick}
        className="flex-1 min-w-0 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-600 line-clamp-1 mt-1">{preview}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">{date}</p>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete conversation"
          title="Delete conversation"
          className="my-3 mr-3 self-center rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
