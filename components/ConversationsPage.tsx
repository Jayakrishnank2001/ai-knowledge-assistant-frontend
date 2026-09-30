'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import ConversationItem from './ConversationItem'
import ConfirmModal from './ConfirmModal'
import { api, ConversationSummary, formatTimestamp } from '@/lib/api'
import { errorText, useDeleteConfirm } from '@/lib/ui'

export default function ConversationsPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [error, setError] = useState('')
  const confirm = useDeleteConfirm<ConversationSummary>()

  useEffect(() => {
    void api
      .conversations()
      .then(setConversations)
      .catch((requestError) => {
        setError(errorText(requestError, 'Could not load conversations'))
      })
  }, [])

  const openConversation = (id: string) => {
    navigate(`/chat?conversation=${encodeURIComponent(id)}`)
  }

  const confirmDelete = async () => {
    if (!confirm.pending) return
    const id = confirm.pending.id
    try {
      confirm.setDeleting(true)
      await api.deleteConversation(id)
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
      setError('')
    } catch (requestError) {
      setError(errorText(requestError, 'Could not delete conversation'))
    } finally {
      confirm.setDeleting(false)
      confirm.setPending(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <Header
        title="Conversations"
        description="View your previous conversations and continue where you left off"
      />

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="my-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="divide-y divide-gray-200">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              title={conv.title}
              preview={conv.preview}
              date={formatTimestamp(conv.date)}
              onClick={() => openConversation(conv.id)}
              onDelete={() => confirm.open(conv)}
              deleting={confirm.deleting && confirm.pending?.id === conv.id}
            />
          ))}
          {conversations.length === 0 && !error && (
            <p className="px-4 py-6 text-sm text-gray-500">
              No conversations yet. Head over to Chat and ask your first question!
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm.pending !== null}
        title="Delete conversation"
        message={`"${confirm.pending?.title ?? ''}" and all of its messages will be permanently deleted. This cannot be undone.`}
        busy={confirm.deleting}
        onConfirm={() => void confirmDelete()}
        onClose={confirm.close}
      />
    </div>
  )
}