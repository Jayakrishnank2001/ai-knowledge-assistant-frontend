'use client'

import React, { useState } from 'react'
import { CloudUpload, File } from 'lucide-react'
import Modal from './Modal'
import { Button } from '@/components/ui/button'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (file: File) => void
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile)
      setSelectedFile(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Modal title="Upload PDF Document" onClose={onClose} labelledBy="upload-modal-title">
      <div className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive
                ? 'border-[#9b56f5] bg-[#f4eaff]'
                : 'border-[#dfd0f5] bg-[#fcfaff]'
            }`}
          >
            <CloudUpload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Drag and drop your PDF file here
            </p>
            <p className="text-xs text-gray-600 mb-4">or</p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-block cursor-pointer rounded-xl bg-[#5517dd] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4310bd]">
                Choose File
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-3">
              Supported format: PDF | Max size: 25MB
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <File className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-700">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1"
            >
              Upload
            </Button>
          </div>
        </div>
    </Modal>
  )
}
