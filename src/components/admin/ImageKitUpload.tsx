'use client'

import { useState, useRef, ChangeEvent, DragEvent, ReactNode } from 'react'
import { Upload, Loader2, ImagePlus, AlertCircle } from 'lucide-react'

interface ImageKitUploadProps {
  onSuccess: (result: { url: string; fileId: string; name: string }) => void
  onError?: (error: string) => void
  folder?: string
  multiple?: boolean
  maxFiles?: number
  accept?: string
  className?: string
  children?: (props: { open: () => void; isUploading: boolean }) => ReactNode
  buttonLabel?: string
  compact?: boolean
}

export function ImageKitUpload({
  onSuccess,
  onError,
  folder = '/uploads',
  multiple = false,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp,image/jpg',
  className = '',
  children,
  buttonLabel = 'Upload Image',
  compact = false,
}: ImageKitUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const open = () => {
    fileInputRef.current?.click()
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('fileName', file.name)

    const response = await fetch('/api/imagekit/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload image')
    }

    return data
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setErrorMessage(null)
    setIsUploading(true)

    const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles : 1)

    try {
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`)
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds the 10MB size limit`)
        }

        const result = await uploadFile(file)
        onSuccess(result)
      }
    } catch (err: any) {
      const msg = err.message || 'Upload failed. Please check your ImageKit credentials in .env.'
      setErrorMessage(msg)
      onError?.(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  // If consumer provided render props, render custom UI
  if (children) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        {children({ open, isUploading })}
        {errorMessage && (
          <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </>
    )
  }

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={open}
          disabled={isUploading}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer ${className}`}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? 'Uploading...' : buttonLabel}</span>
        </button>
        {errorMessage && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={open}
        className={`w-full border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
          dragOver
            ? 'border-[#E07B0C] bg-[#E07B0C]/5'
            : 'border-stone-300 bg-stone-50 hover:bg-stone-100/80 hover:border-stone-400'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-stone-600">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#E07B0C]" />
          ) : (
            <ImagePlus className="w-6 h-6 text-[#E07B0C]" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-stone-800">
            {isUploading ? 'Uploading to ImageKit...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            PNG, JPG, JPEG, WEBP up to 10MB {multiple ? `(Max ${maxFiles} files)` : ''}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-2 text-xs text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
