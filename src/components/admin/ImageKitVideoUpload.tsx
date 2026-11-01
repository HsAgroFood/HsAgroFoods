'use client'

import { MAX_VIDEO_MB } from '@/lib/reels'
import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

/**
 * Uploads a video straight from the browser to ImageKit (using a signed token from /api/imagekit/auth),
 * so large files never pass through our server's request-size limit.
 */
export function ImageKitVideoUpload({
  onSuccess,
  folder = '/reels',
  children,
}: {
  onSuccess: (result: { url: string; fileId: string }) => void
  folder?: string
  children: (props: { open: () => void; isUploading: boolean; progress: number; error: string | null }) => ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
    if (!publicKey) throw new Error('NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY is not set in .env.')

    const authRes = await fetch('/api/imagekit/auth', { cache: 'no-store' })
    if (!authRes.ok) throw new Error('Could not authorise the upload. Please log in to the admin again.')
    const { token, expire, signature } = await authRes.json()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))
    formData.append('folder', folder)
    formData.append('useUniqueFileName', 'true')
    formData.append('publicKey', publicKey)
    formData.append('token', token)
    formData.append('expire', String(expire))
    formData.append('signature', signature)

    return new Promise<{ url: string; fileId: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', IMAGEKIT_UPLOAD_URL)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onerror = () => reject(new Error('Network error while uploading the video.'))
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300 && body.url) resolve({ url: body.url, fileId: body.fileId })
          else reject(new Error(body.message || 'ImageKit rejected the video.'))
        } catch {
          reject(new Error('Unexpected response from ImageKit.'))
        }
      }
      xhr.send(formData)
    })
  }

  const open = () => inputRef.current?.click()

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    if (!file.type.startsWith('video/')) return setError('Please choose a video file (MP4 or MOV).')
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      return setError(`This video is ${sizeMb}MB. The maximum allowed is ${MAX_VIDEO_MB}MB. Please compress or trim it and try again.`)
    }

    setIsUploading(true)
    setProgress(0)
    try {
      onSuccess(await upload(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleChange} className="hidden" />
      {children({ open, isUploading, progress, error })}
    </>
  )
}
