"use client"

import { useState } from "react"
import { ShieldAlert, X, Scale, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { createAppeal } from "@/lib/actions/appeal"

interface AppealModalProps {
  isOpen: boolean
  onClose: () => void
  reportId: string
}

export function AppealModal({ isOpen, onClose, reportId }: AppealModalProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await createAppeal({ reportId, reason })
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setReason("")
          onClose()
        }, 3000)
      }
    } catch {
      setError("Failed to transmit appeal signal.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-truth-nearBlack border-2 border-truth-midGray shadow-[12px_12px_0px_rgba(0,229,255,0.1)] overflow-hidden rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-truth-accentBlue p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-truth-bg" />
            <h2 className="font-bitter font-black text-truth-bg uppercase tracking-tight">Signal_Appeal</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-truth-bg/10 rounded-full transition-colors text-truth-bg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {success ? (
            <div className="py-12 flex flex-col items-center gap-6 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-truth-accentGreen/10 border-2 border-truth-accentGreen flex items-center justify-center rounded-full">
                <CheckCircle2 className="w-10 h-10 text-truth-accentGreen" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tighter">Appeal Transmitted</h3>
                <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest leading-relaxed">
                  Your case has been placed in the protocol review queue.<br />Administrative consensus will follow.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-truth-accentBlue/5 border-l-2 border-truth-accentBlue">
                  <ShieldAlert className="w-5 h-5 text-truth-accentBlue shrink-0 mt-1" />
                  <p className="font-mono text-[10px] text-truth-textGray uppercase leading-relaxed">
                    You are contesting a protocol-level termination. Transmit your justification below for human verification.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="font-mono text-[9px] uppercase tracking-[0.3em] text-truth-textGray font-bold">Justification_Packet</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide evidence of protocol compliance..."
                    className="w-full bg-black border border-truth-midGray p-4 font-bitter text-truth-textLight focus:outline-none focus:border-truth-accentBlue min-h-[150px] transition-all selection:bg-truth-accentBlue/30 text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-truth-textGray">
                    <span>Target: {reportId.substring(0, 12)}...</span>
                    <span>{reason.length} / 500</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-truth-accentRed/10 border border-truth-accentRed/50 flex items-center gap-3 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-truth-accentRed shrink-0" />
                  <p className="font-mono text-[10px] text-truth-accentRed uppercase font-bold">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 border border-truth-midGray text-truth-textGray font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  disabled={!reason.trim() || isSubmitting}
                  onClick={handleSubmit}
                  className={`flex-2 py-4 font-mono text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                    !reason.trim() || isSubmitting 
                      ? "bg-truth-midGray/20 text-truth-textGray cursor-not-allowed" 
                      : "bg-truth-accentBlue text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synchronizing...
                    </>
                  ) : "Transmit Appeal"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
