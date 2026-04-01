"use client"

import { useState, useCallback } from "react"
import { upload } from "@vercel/blob/client"
import imageCompression from "browser-image-compression"
import { X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface MediaUploaderProps {
  onMediaChange: (media: { url: string; type: "IMAGE" | "VIDEO" | "AUDIO" }[]) => void
  maxFiles?: number
}

export default function MediaUploader({ onMediaChange, maxFiles = 4 }: MediaUploaderProps) {
  const [files, setFiles] = useState<{ id: string; url: string; uploading: boolean; error?: string }[]>([])

  const handleUpload = useCallback(async (file: File) => {
    const id = Math.random().toString(36).substring(7)
    
    // Initial state: uploading
    setFiles(prev => [...prev, { id, url: URL.createObjectURL(file), uploading: true }])

    try {
      // 1. Client-Side Compression & EXIF Stripping
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // 2. Direct Vercel Blob Upload
      const blob = await upload(compressedFile.name, compressedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      // 3. Update State with Final URL
      setFiles(prev => {
        const updated = prev.map(f => f.id === id ? { ...f, url: blob.url, uploading: false } : f)
        // Notify parent
        const completedMedia = updated
          .filter(f => !f.uploading && !f.error)
          .map(f => ({ url: f.url, type: 'IMAGE' as const }))
        onMediaChange(completedMedia)
        return updated
      })
    } catch (error) {
      console.error("[PROTOCOL_UPLOAD_ERROR]", error)
      setFiles(prev => prev.map(f => f.id === id ? { ...f, uploading: false, error: "SIGNAL_LOST" } : f))
    }
  }, [onMediaChange])

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const remainingSlots = maxFiles - files.length
    
    selectedFiles.slice(0, remainingSlots).forEach(file => {
      if (file.type.startsWith("image/")) {
        handleUpload(file)
      }
    })
    
    // Reset input
    e.target.value = ""
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      onMediaChange(updated.filter(f => !f.uploading && !f.error).map(f => ({ url: f.url, type: 'IMAGE' as const })))
      return updated
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload Trigger */}
      {files.length < maxFiles && (
        <label className="flex items-center gap-2 px-3 py-1.5 border-2 border-truth-midGray rounded-lg bg-truth-nearBlack hover:border-truth-accentGreen/50 transition-all cursor-pointer group">
          <ImageIcon className="w-4 h-4 text-truth-textGray group-hover:text-truth-accentGreen transition-colors" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray group-hover:text-truth-textLight transition-colors">
            Attach Signal [{files.length}/{maxFiles}]
          </span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={onFileSelect}
          />
        </label>
      )}

      {/* Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="relative group aspect-square rounded-lg border-2 border-truth-midGray overflow-hidden bg-black"
            >
              {/* Image Preview */}
              <Image 
                src={file.url} 
                alt="Signal Fragment" 
                fill 
                className={`object-cover transition-opacity duration-500 ${file.uploading ? 'opacity-30' : 'opacity-100'}`}
                unoptimized // Use unoptimized for blob URLs or external URLs in dev
              />

              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />

              {/* Uploading State */}
              {file.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
                  <Loader2 className="w-6 h-6 text-truth-accentGreen animate-spin mb-2" />
                  <span className="font-mono text-[8px] text-truth-accentGreen uppercase tracking-tighter">Synchronizing...</span>
                </div>
              )}

              {/* Error State */}
              {file.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-truth-accentRed/40 z-20">
                  <AlertCircle className="w-6 h-6 text-white mb-1" />
                  <span className="font-mono text-[8px] text-white uppercase font-bold tracking-tighter">{file.error}</span>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => { e.preventDefault(); removeFile(file.id); }}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-truth-accentRed text-white rounded-md transition-colors z-30 opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
