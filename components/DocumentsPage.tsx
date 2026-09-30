'use client'

import React, { useEffect, useState } from 'react'
import Header from './Header'
import DocumentCard from './DocumentCard'
import UploadModal from './UploadModal'
import ConfirmModal from './ConfirmModal'
import DocumentPreviewModal from './DocumentPreviewModal'
import { api, DocumentRecord, formatTimestamp } from '@/lib/api'
import { errorText, useDeleteConfirm } from '@/lib/ui'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [pendingPreview, setPendingPreview] = useState<DocumentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const confirm = useDeleteConfirm<DocumentRecord>()

  const refresh = async () => {
    try {
      setDocuments(await api.documents())
      setError('')
    } catch (requestError) {
      setError(errorText(requestError, 'Could not load documents'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  // While any document is still "processing", keep polling until it finishes.
  useEffect(() => {
    if (!documents.some((doc) => doc.status === 'processing')) return
    const timer = setTimeout(() => void refresh(), 4000)
    return () => clearTimeout(timer)
  }, [documents])

  const handleUpload = async (file: File) => {
    try {
      await api.uploadDocument(file)
      setError('')
      void refresh()
    } catch (requestError) {
      setError(errorText(requestError, 'Upload failed'))
    }
  }

  const confirmDelete = async () => {
    if (!confirm.pending) return
    try {
      confirm.setDeleting(true)
      await api.deleteDocument(confirm.pending.id)
      setError('')
      void refresh()
    } catch (requestError) {
      setError(errorText(requestError, 'Delete failed'))
    } finally {
      confirm.setDeleting(false)
      confirm.setPending(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <Header
        title="Documents"
        description="Upload and manage your PDF documents. Our system will process them to make them searchable with AI."
        showUploadButton
        onUpload={() => setIsUploadOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="space-y-3">
          {isLoading && documents.length === 0 && (
            <p className="text-sm text-gray-500">Loading your documents…</p>
          )}
          {!isLoading && documents.length === 0 && !error && (
            <p className="text-sm text-gray-500">
              No documents yet. Upload a PDF to start building your knowledge base.
            </p>
          )}
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              fileName={doc.fileName}
              fileSize={doc.fileSize}
              status={doc.status}
              uploadedAt={formatTimestamp(doc.uploadedAt)}
              onPreview={() => setPendingPreview(doc)}
              onDelete={() => confirm.open(doc)}
            />
          ))}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      <ConfirmModal
        isOpen={confirm.pending !== null}
        title="Delete document"
        message={`"${confirm.pending?.fileName ?? ''}" will be permanently removed from your knowledge base. This cannot be undone.`}
        busy={confirm.deleting}
        onConfirm={() => void confirmDelete()}
        onClose={confirm.close}
      />

      <DocumentPreviewModal
        document={pendingPreview}
        onClose={() => setPendingPreview(null)}
      />
    </div>
  )
}