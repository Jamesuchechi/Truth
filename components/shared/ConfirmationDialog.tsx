"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { useEffect } from "react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm_Action",
  cancelText = "Abort_Mission",
  type = "danger"
}: ConfirmationDialogProps) {
  
  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const colorClass = type === "danger" 
    ? "text-truth-accentRed border-truth-accentRed" 
    : type === "warning" 
    ? "text-truth-accentYellow border-truth-accentYellow" 
    : "text-truth-accentBlue border-truth-accentBlue"

  const btnClass = type === "danger"
    ? "bg-truth-accentRed hover:bg-truth-accentRed/90"
    : type === "warning"
    ? "bg-truth-accentYellow hover:bg-truth-accentYellow/90 text-black"
    : "bg-truth-accentBlue hover:bg-truth-accentBlue/90 text-black"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-250"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-251 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-full max-w-md bg-card border-2 border-border shadow-[20px_20px_0px_rgba(0,0,0,0.3)] overflow-hidden rounded-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-muted/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                  <h2 className="font-bitter font-black text-sm uppercase tracking-wider text-foreground">
                    {title}
                  </h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-muted/20 transition-colors">
                  <X className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="font-mono text-xs text-muted uppercase tracking-relaxed leading-relaxed">
                  {description}
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      onConfirm()
                      onClose()
                    }}
                    className={`flex-1 py-3 font-mono text-[10px] uppercase font-bold tracking-[0.2em] transition-all transform active:scale-95 ${btnClass} text-black shadow-[4px_4px_0px_rgba(0,0,0,0.2)]`}
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 font-mono text-[10px] uppercase font-bold tracking-[0.2em] bg-muted/10 border-2 border-border text-muted hover:border-foreground hover:text-foreground transition-all transform active:scale-95"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>

              {/* Decorative Scanline */}
              <div className="h-1 w-full bg-linear-to-r from-transparent via-border to-transparent opacity-20" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
