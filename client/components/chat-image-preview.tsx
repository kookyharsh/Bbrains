'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Download, X, File, PlayCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

export interface ChatAttachment {
  url: string
  type: string
  name?: string
}

interface ChatImagePreviewProps {
  attachment: ChatAttachment
  className?: string
  variant?: 'compact' | 'message'
}

export function ChatImagePreview({ 
  attachment, 
  className = '',
  variant = 'compact',
}: ChatImagePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [messageAspectRatio, setMessageAspectRatio] = useState<number | null>(null)
  const urlWithoutQuery = attachment.url.split(/[?#]/)[0]

  // Robust type checking
  const isImage = attachment.type?.toLowerCase().includes('image') ||
                  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlWithoutQuery)
  
  const isVideo = attachment.type?.toLowerCase().includes('video') || 
                  /\.(mp4|webm|ogg|mov)$/i.test(urlWithoutQuery)

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      // 1. Try fetching as blob (best approach for cross-origin if CORS is allowed)
      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let filename = attachment.name || 'file';
      
      // Ensure extension exists
      if (!filename.includes('.')) {
        const urlPath = attachment.url.split(/[?#]/)[0];
        const urlExt = urlPath.includes('.') ? urlPath.split('.').pop() : null;
        
        let ext = 'file';
        if (attachment.type?.includes('/')) {
          ext = attachment.type.split('/')[1];
          // Simple normalizations
          if (ext === 'jpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
        } else if (urlExt && urlExt.length < 6) {
          ext = urlExt;
        }
        filename += `.${ext}`;
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Download error:', error);
      
      // 2. Fallback: For Cloudinary URLs, we can force download by adding fl_attachment
      if (attachment.url.includes('cloudinary.com')) {
        let downloadUrl = attachment.url;
        // Clean name for Cloudinary (no dots or special chars in fl_attachment filename segment)
        const cleanBaseName = (attachment.name || 'file').split('.')[0].replace(/[^\w-]/g, '_');
        const flag = `fl_attachment:${cleanBaseName}`;
        
        if (downloadUrl.includes('/upload/')) {
          downloadUrl = downloadUrl.replace('/upload/', `/upload/${flag}/`);
        } else if (downloadUrl.includes('/video/upload/')) {
          downloadUrl = downloadUrl.replace('/video/upload/', `/video/upload/${flag}/`);
        }
        
        window.location.href = downloadUrl;
      } else {
        // Final fallback: open in new tab
        window.open(attachment.url, '_blank');
      }
    }
 finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={cn('relative group cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm hover:shadow-md transition-all duration-200', className)}>
          {isImage ? (
            <div
              className={cn(
                'relative overflow-hidden',
                variant === 'message'
                  ? 'w-full max-h-[70vh] md:max-h-[50vh]'
                  : 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32'
              )}
              style={variant === 'message' ? { aspectRatio: messageAspectRatio ?? 16 / 9 } : undefined}
            >
              <Image
                src={attachment.url}
                alt={attachment.name || 'Preview'}
                fill
                className={cn(
                  'transition-transform duration-300',
                  variant === 'message' ? 'object-contain' : 'object-cover',
                  variant === 'message' ? 'hover:scale-[1.02]' : 'hover:scale-105'
                )}
                onLoadingComplete={(img) => {
                  if (variant !== 'message') return
                  const w = img.naturalWidth
                  const h = img.naturalHeight
                  if (!w || !h) return
                  setMessageAspectRatio(w / h)
                }}
                sizes={
                  variant === 'message'
                    ? '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 640px'
                    : '(max-width: 768px) 96px, (max-width: 1200px) 112px, 128px'
                }
              />
            </div>
          ) : isVideo ? (
            <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-black flex items-center justify-center relative group">
              <video src={attachment.url} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                   <PlayCircle className="w-6 h-6 text-white fill-white/20" />
                 </div>
              </div>
            </div>
          ) : (
             <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex flex-col items-center justify-center gap-1.5 p-2">
               <File className="w-6 h-6 text-muted-foreground" />
               <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
                 {attachment.name || 'File'}
               </span>
             </div>
          )}
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>{attachment.name || 'Attachment Preview'}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden.Root>
        
        <div className="relative w-full h-full flex flex-col">
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              disabled={isDownloading}
              className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white shadow-lg transition-all"
              onClick={handleDownload}
              title="Download"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10 text-white shadow-lg transition-all"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </div>

          {/* Main Viewport */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-[60vh]">
            {isImage ? (
              <div className="relative w-full h-[80vh] animate-in fade-in zoom-in-95 duration-300">
                <Image
                  src={attachment.url}
                  alt={attachment.name || 'Full view'}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : isVideo ? (
              <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <video
                  src={attachment.url}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[85vh]"
                />
              </div>
            ) : (
              <div className="text-center text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <File className="w-12 h-12 opacity-50" />
                </div>
                <p className="text-xl font-semibold mb-2">{attachment.name || 'Unnamed File'}</p>
                <p className="text-sm text-white/50 mb-8">{attachment.type}</p>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 rounded-full">
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    Open Original File
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {(isImage || isVideo) && attachment.name && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/70 text-sm whitespace-nowrap">
              {attachment.name}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
