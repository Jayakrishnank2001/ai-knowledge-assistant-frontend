'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

interface ConversationItemProps {
  title: string
  preview: string
  date: string
  onClick?: () => void
}

export default function ConversationItem({
  title,
  preview,
  date,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-600 line-clamp-1 mt-1">{preview}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 ml-2 flex-shrink-0 group-hover:text-gray-600" />
      </div>
      <p className="text-xs text-gray-500 mt-2">{date}</p>
    </button>
  )
}
