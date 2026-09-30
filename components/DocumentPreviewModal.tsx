'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import Modal from './Modal'
import { api, DocumentRecord } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/lib/ui'

interface DocumentPreviewModalProps {
  /** The document to preview, or null when the modal is closed. */
  document: DocumentRecord | null
  onClose: () => void
}

/**
 * In-app PDF preview. The file endpoint requires the Bearer token, so the
 * browser cannot point an <iframe> at the API URL directly - instead the PDF is
 * fetched as a Blob and rendered from a temporary object URL.
 */
export default function DocumentPreviewModal({
  document: doc,
  onClose,
}: DocumentPreviewModalProps) {
  const [objectUrl, setObjectUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const docId = doc?.id ?? ''

  useEffect(() => {
    if (!docId) return

    let cancelled = false
    let createdUrl = ''

    setIsLoading(true)
    setError('')
    setObjectUrl('')

    api
      .documentFile(docId)
      .then((blob) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setObjectUrl(createdUrl)
      })
      .catch((requestError) => {
        if (cancelled) return
        setError(
          requestError instanceof Error ? requestError.message : 'Could not load this document'
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    // Revoke the blob URL when the modal closes or another document is opened.
    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [docId])

  // Escape closes the preview.
  useEscapeKey(Boolean(doc), onClose)

  if (!doc) return null

  const handleSaveCopy = () => {
    if (!objectUrl) return
    const link = window.document.createElement('a')
    link.href = objectUrl
    link.download = doc.fileName
    link.click()
  }

  return (
    <Modal
      title={doc.fileName}
      onClose={onClose}
      wide
      labelledBy="document-preview-title"
    >
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f4eaff]">
              <FileText className="size-5 text-[#5517dd]" />
            </span>
            <div className="min-w-0">
              <h2
                id="document-preview-title"
                title={doc.fileName}
                className="truncate text-base font-semibold text-gray-900"
              >
                {doc.fileName}
              </h2>
              <p className="text-xs text-[#554e61]">
                {doc.fileSize}
                {doc.pageCount > 0 && ` · ${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => objectUrl && window.open(objectUrl, '_blank', 'noopener')}
              disabled={!objectUrl}
              title="Open the PDF in a new browser tab"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Open in new tab</span>
            </Button>
            <Button size="sm" onClick={handleSaveCopy} disabled={!objectUrl}>
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Body - the embedded PDF viewer */}
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#554e61]">
              <Loader2 className="size-6 animate-spin text-[#5517dd]" />
              <p className="text-sm">Loading preview…</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="grid size-10 place-items-center rounded-full bg-red-50">
                <AlertCircle className="size-5 text-red-600" />
              </span>
              <p className="max-w-md text-sm text-[#554e61]">{error}</p>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          {!isLoading && !error && objectUrl && (
            <iframe
              src={objectUrl}
              title={`Preview of ${doc.fileName}`}
              className="h-full w-full"
            />
          )}
        </div>
    </Modal>
  )
}
