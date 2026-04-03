"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, CheckCircle2, ArrowRight } from "lucide-react"
import { createPost } from "@/lib/actions/post"
import { useToast } from "@/components/providers/ToastProvider"

const STARTER_PROMPTS = [
  "A truth I've never told anyone before is...",
  "My deepest realization about society is...",
  "If I could speak to my past self, I'd say...",
  "The most human thing about me is...",
  "Lately, I've been questioning why we...",
]

export function PromptStep({ onComplete }: { onComplete: () => void }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("content", content)
    formData.append("visibility", "PUBLIC")

    const res = await createPost(formData)
    if (res.error) {
      showToast(typeof res.error === 'string' ? res.error : "Signal failure.", "error")
      setIsSubmitting(false)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div className="space-y-2">
        <h1 className="font-bitter text-3xl font-black uppercase tracking-tighter text-foreground">
          Emit_First_Signal
        </h1>
        <p className="font-mono text-[9px] text-muted uppercase tracking-widest leading-relaxed">
          The void is listening. Start your journey with a single truth.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="w-16 h-16 bg-truth-accentGreen/20 flex items-center justify-center rounded-full border border-truth-accentGreen/30">
              <CheckCircle2 className="w-8 h-8 text-truth-accentGreen" />
            </div>
            <p className="font-mono text-[10px] uppercase font-bold text-truth-accentGreen">Signal_Synchronized</p>
            <p className="font-mono text-[8px] text-muted uppercase">Redirecting to feed...</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setContent(prompt)}
                  className="px-3 py-1.5 border border-border bg-muted/5 font-mono text-[8px] text-muted hover:text-foreground hover:border-foreground transition-all"
                >
                  <Sparkles className="w-2.5 h-2.5 inline mr-1 opacity-50" /> {prompt.slice(0, 30)}...
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Synchronize your thoughts..."
                className="w-full h-32 bg-card border-2 border-border p-4 font-mono text-sm text-foreground focus:outline-none focus:border-truth-accentRed transition-all resize-none shadow-sm"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <span className="font-mono text-[8px] text-muted/40">{content.length}/2000</span>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="p-2 bg-truth-accentRed text-black disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
            
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-4 border-2 border-transparent text-muted font-mono text-[10px] uppercase font-black tracking-[0.2em] flex items-center justify-center gap-3 hover:text-foreground transition-all"
            >
              Skip_Initialization <ArrowRight className="w-4 h-4 opacity-30" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
