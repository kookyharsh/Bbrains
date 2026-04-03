import { useCallback, useState } from 'react'

// Cloudinary unsigned upload helper
const rawCloudName = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME) : '') as string;
const rawPreset = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? process.env.CLOUDINARY_UPLOAD_PRESET) : '') as string;
const CLOUD_NAME = (rawCloudName || '').toString().replace(/^"|"$/g, '');
const UPLOAD_PRESET = (rawPreset || '').toString().replace(/^"|"$/g, '');

type AttachmentUpload = { url: string; type: string; name?: string }

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previews, setPreviews] = useState<AttachmentUpload[]>([])

  const uploadFile = useCallback(async (file: File, options?: { folder?: string; useFilename?: boolean }): Promise<string | null> => {
    if (!file) return null
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.warn('Cloudinary config not set')
      return null
    }
    setIsUploading(true)
    setProgress(0)
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', UPLOAD_PRESET)
    form.append('folder', options?.folder || 'chat attachment')
    if (options?.useFilename) {
      form.append('use_filename', 'true')
      form.append('unique_filename', 'false')
    }
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      const promise = new Promise<string | null>((resolve) => {
        xhr.onload = () => {
          try {
            console.log('Cloudinary response status:', xhr.status)
            console.log('Cloudinary response text:', xhr.responseText)
            const data = JSON.parse(xhr.responseText)
            if (xhr.status >= 400) {
              console.error('Cloudinary upload error:', data.error)
              setIsUploading(false)
              setProgress(0)
              resolve(null)
              return
            }
            const secureUrl = data?.secure_url ?? null
            if (secureUrl) {
              const att = { url: secureUrl, type: file.type, name: file.name }
              setPreviews((p) => [...p, att])
              resolve(secureUrl)
            } else {
              console.error('No secure_url in Cloudinary response:', data)
              resolve(null)
            }
          } catch (e) {
            console.error('Failed to parse Cloudinary response:', e)
            console.error('Raw response:', xhr.responseText)
            resolve(null)
          }
          setIsUploading(false)
          setProgress(0)
        }
        xhr.onerror = () => {
          console.error('Cloudinary XHR error')
          setIsUploading(false)
          resolve(null)
        }
        xhr.send(form)
      })
      const res = await promise
      return res
    } catch {
      setIsUploading(false)
      return null
    }
  }, [])

  return { isUploading, progress, previews, uploadFile }
}
