"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Shield, Globe, Reply, AlertCircle, Sparkles } from "lucide-react"
import { replyToMessage } from "@/lib/actions/messageActions"

interface ReplyModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  messageContent: string
  receiverName: string
}

export default function ReplyModal({ isOpen, onClose, messageId, messageContent, receiverName }: ReplyModalProps) {
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReply = () => {
    if (!content.trim()) return

    startTransition(async () => {
      try {
        await replyToMessage(messageId, content, isPublic)
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setContent("")
          setSuccess(false)
        }, 2000)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to transmit reply."
        setError(errorMessage)
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-truth-nearBlack/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-truth-nearBlack border-4 border-truth-midGray shadow-[24px_24px_0px_rgba(255,51,102,0.1)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-truth-midGray bg-truth-darkGray/30">
          <div className="flex items-center gap-3">
            <Reply className="w-5 h-5 text-truth-accentRed" />
            <h2 className="font-bitter font-black text-2xl uppercase tracking-tighter text-truth-textLight">
              Signal_Response
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-truth-accentRed hover:text-truth-bg transition-colors text-truth-textGray">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Quoted Message */}
          <div className="p-4 bg-truth-darkGray border-l-4 border-truth-accentRed">
            <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-widest font-bold">Incoming Signal Fragment:</span>
            <p className="font-bitter text-sm text-truth-textLight/70 italic mt-1 line-clamp-2">
              &quot;{messageContent}&quot;
            </p>
          </div>

          {/* Input */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <span className="font-mono text-[10px] text-truth-textGray uppercase font-black tracking-widest">Construct_Response:</span>
               <span className={`font-mono text-[10px] ${content.length > 450 ? 'text-truth-accentRed' : 'text-truth-textGray'}`}>{content.length}/500</span>
             </div>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               disabled={isPending || success}
               placeholder={`Transmitting response to @${receiverName}...`}
               className="w-full h-40 bg-truth-bg border-2 border-truth-midGray p-5 font-mono text-xs text-truth-textLight focus:outline-none focus:border-truth-accentRed transition-all resize-none placeholder:text-truth-textGray/20"
             />
          </div>

          {/* Visibility Toggle */}
          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => setIsPublic(false)}
                className={`flex flex-col items-center justify-center p-4 border-2 transition-all gap-2
                   ${!isPublic ? 'border-truth-accentBlue bg-truth-accentBlue/5 text-truth-accentBlue' : 'border-truth-midGray text-truth-textGray hover:border-truth-textLight'}`}
             >
                <Shield className="w-5 h-5" />
                <div className="text-center">
                  <p className="font-mono text-[10px] font-black uppercase leading-none">Private_Thread</p>
                  <p className="font-mono text-[7px] uppercase mt-1 opacity-60">Continue_Ghost_Channel</p>
                </div>
             </button>

             <button 
                onClick={() => setIsPublic(true)}
                className={`flex flex-col items-center justify-center p-4 border-2 transition-all gap-2
                   ${isPublic ? 'border-truth-accentGreen bg-truth-accentGreen/5 text-truth-accentGreen' : 'border-truth-midGray text-truth-textGray hover:border-truth-textLight'}`}
             >
                <Globe className="w-5 h-5" />
                <div className="text-center">
                  <p className="font-mono text-[10px] font-black uppercase leading-none">Public_Reveal</p>
                  <p className="font-mono text-[7px] uppercase mt-1 opacity-60">Convert_To_Feed_Post</p>
                </div>
             </button>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 border-2 border-truth-accentRed bg-truth-accentRed/5 text-truth-accentRed font-mono text-[10px] uppercase"
              >
                <AlertCircle className="w-5 h-5" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 border-2 border-truth-accentGreen bg-truth-accentGreen/5 text-truth-accentGreen font-mono text-[10px] uppercase font-black"
              >
                <Sparkles className="w-5 h-5" /> SIGNAL_SYNCHRONIZED_SUCCESSFULLY
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action */}
          <button
            onClick={handleReply}
            disabled={isPending || !content.trim() || success}
            className={`w-full py-5 flex items-center justify-center gap-3 font-bitter font-black uppercase text-lg tracking-tighter transition-all relative overflow-hidden
              ${isPending || !content.trim() || success
                ? "bg-truth-midGray text-truth-textGray cursor-not-allowed"
                : "bg-truth-accentRed text-truth-bg hover:bg-truth-textLight hover:text-truth-bg shadow-[12px_12px_0px_rgba(18,16,16,0.3)] active:translate-x-1 active:translate-y-1"}`}
          >
            {isPending ? "TRANSMITTING..." : (
               <>
                 <Send className="w-5 h-5" />
                 INITIATE_RESPONSE
               </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
