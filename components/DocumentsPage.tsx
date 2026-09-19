'use client'

import React, { useState } from 'react'
import Header from './Header'
import DocumentCard from './DocumentCard'
import UploadModal from './UploadModal'

const MOCK_DOCUMENTS = [
  {
    fileName: 'Employee Handbook.pdf',
    fileSize: '12.4 MB',
    status: 'completed' as const,
    uploadedAt: 'Apr 26, 2025, 10:24 AM',
  },
  {
    fileName: 'Leave Policy.pdf',
    fileSize: '5.7 MB',
    status: 'completed' as const,
    uploadedAt: 'Apr 26, 2025, 09:50 AM',
  },
  {
    fileName: 'IT Security Guide.pdf',
    fileSize: '3.2 MB',
    status: 'processing' as const,
    uploadedAt: 'Apr 26, 2025, 09:32 AM',
  },
  {
    fileName: 'Company Overview.pdf',
    fileSize: '8.5 MB',
    status: 'failed' as const,
    uploadedAt: 'Apr 26, 2025, 08:15 AM',
  },
]

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name)
    // Mock upload - in real app this would send to backend
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
        <div className="space-y-3">
          {MOCK_DOCUMENTS.map((doc, idx) => (
            <DocumentCard key={idx} {...doc} />
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
