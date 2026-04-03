"use client"

import { useState } from "react"
import { ShieldAlert, X, Flag, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { reportContent } from "@/lib/actions/report"
import type { ReportReason } from "@prisma/client"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetId: string
  type: 'POST' | 'MESSAGE'
}

const REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "HARASSMENT", label: "Harassment", description: "Targeted bullying or unwanted persistent contact." },
  { value: "HATE_SPEECH", label: "Hate Speech", description: "Attacking protected groups or individuals based on identity." },
  { value: "VIOLENCE", label: "Violence", description: "Threatening physical harm or promoting dangerous acts." },
  { value: "SPAM", label: "Spam / Repetitive", description: "Automated content, scams, or excessive repetitive signals." },
  { value: "INAPPROPRIATE", label: "Inappropriate", description: "Graphic content or protocol-violating themes." },
  { value: "SELF_HARM", label: "Self-Harm", description: "Encouraging or depicting self-inflicted harm." },
  { value: "OTHER", label: "Other", description: "Reporting for reasons not listed above." },
]

export function ReportModal({ isOpen, onClose, targetId, type }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason) return
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await reportContent({
        targetId,
        type,
        reason: reason as ReportReason,
        description,
        isAnonymous
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          onClose()
          // Reset state
          setIsSuccess(false)
          setReason("")
          setDescription("")
        }, 2000)
      }
    } catch {
      setError("Failed to transmit report packet.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-truth-nearBlack border-2 border-truth-midGray shadow-[12px_12px_0px_rgba(255,51,102,0.1)] overflow-hidden rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-truth-midGray bg-truth-nearBlack">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-truth-accentRed animate-pulse" />
            <h2 className="font-bitter text-2xl font-black tracking-tighter uppercase">
              Flag System Signal
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-truth-midGray/10 text-truth-textGray hover:text-truth-textLight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-truth-accentGreen/10 border-2 border-truth-accentGreen rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-truth-accentGreen" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bitter text-2xl font-black uppercase">Report Encrypted</h3>
                <p className="font-mono text-sm text-truth-textGray uppercase tracking-widest">
                  Signal received. Protocol moderators notified.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Category Selection */}
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-black uppercase text-truth-accentRed tracking-[0.2em] flex items-center gap-2">
                  <Flag className="w-3 h-3" /> Select Category
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {REASONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setReason(r.value)}
                      className={`text-left p-4 border transition-all duration-300 relative group ${
                        reason === r.value 
                          ? "border-truth-accentRed bg-truth-accentRed/5" 
                          : "border-truth-midGray hover:border-truth-textGray bg-black/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-bitter font-black uppercase tracking-tight ${
                          reason === r.value ? "text-truth-accentRed" : "text-truth-textLight"
                        }`}>
                          {r.label}
                        </span>
                        {reason === r.value && (
                          <div className="w-3 h-3 bg-truth-accentRed rounded-full animate-ping" />
                        )}
                      </div>
                      <p className="font-mono text-[9px] text-truth-textGray mt-1 uppercase leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                        {r.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-black uppercase text-truth-textGray tracking-[0.2em] flex items-center gap-2">
                  <Info className="w-3 h-3" /> Additional Intelligence
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context or specific details [OPTIONAL]"
                  className="w-full bg-black/40 border border-truth-midGray p-5 font-mono text-xs text-truth-textLight focus:outline-none focus:border-truth-accentRed transition-colors min-h-[120px] resize-none uppercase placeholder:text-truth-midGray/40"
                />
              </div>

              {/* Privacy Setting */}
              <div 
                className="flex items-center justify-between p-4 bg-black/40 border border-truth-midGray cursor-pointer hover:border-truth-textGray transition-colors"
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div className="space-y-1">
                  <div className="font-bitter font-black text-xs uppercase text-truth-textLight">Report Anonymously</div>
                  <div className="font-mono text-[8px] text-truth-textGray uppercase">Identity nodes will be masked from recipient</div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${isAnonymous ? "bg-truth-accentRed" : "bg-truth-midGray"}`}>
                  <div className={`absolute w-4 h-4 bg-white rounded-full transition-all ${isAnonymous ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-truth-accentRed/10 border border-truth-accentRed/50 flex items-center gap-3 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-truth-accentRed shrink-0" />
                  <p className="font-mono text-[10px] text-truth-accentRed uppercase font-bold">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="p-8 bg-truth-nearBlack border-t border-truth-midGray flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 border border-truth-midGray font-mono text-[10px] uppercase font-black tracking-widest text-truth-textGray hover:bg-truth-midGray/10 hover:text-truth-textLight transition-all"
            >
              ABORT_FLAG
            </button>
            <button
              disabled={!reason || isSubmitting}
              onClick={handleSubmit}
              className={`flex-2 py-4 font-mono text-[10px] uppercase font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                !reason || isSubmitting
                  ? "bg-truth-midGray/20 text-truth-textGray cursor-not-allowed"
                  : "bg-truth-accentRed text-white hover:shadow-[0_0_20px_rgba(255,51,102,0.4)]"
              }`}
            >
              {isSubmitting ? (
                <>ENCRYPTING_REPORT...</>
              ) : (
                <>TRANSMIT_ALERT_SIGNAL</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
