'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import ConversationItem from './ConversationItem'
import ConfirmModal from './ConfirmModal'
import { api, ConversationSummary, formatTimestamp } from '@/lib/api'

export default function ConversationsPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ConversationSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .conversations()
      .then(setConversations)
      .catch((requestError) => {
        setError(
          requestError instanceof Error ? requestError.message : 'Could not load conversations',
        )
      })
  }, [])

  const openConversation = (id: string) => {
    navigate(`/chat?conversation=${encodeURIComponent(id)}`)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    try {
      setDeletingId(id)
      await api.deleteConversation(id)
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
      setError('')
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Could not delete conversation',
      )
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
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
              onDelete={() => setPendingDelete(conv)}
              deleting={deletingId === conv.id}
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
        isOpen={pendingDelete !== null}
        title="Delete conversation"
        message={`"${pendingDelete?.title ?? ''}" and all of its messages will be permanently deleted. This cannot be undone.`}
        busy={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  )
}