'use client'

import React, { useEffect, useState } from 'react'
import Header from './Header'
import DocumentCard from './DocumentCard'
import UploadModal from './UploadModal'
import { api, DocumentRecord, formatTimestamp } from '@/lib/api'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const docs = await api.documents()
      setDocuments(docs)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load documents')
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
      setError(requestError instanceof Error ? requestError.message : 'Upload failed')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.deleteDocument(id)
      setError('')
      void refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Delete failed')
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
              onDelete={() => void handleDelete(doc.id, doc.fileName)}
            />
          ))}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}