"use client"

import { useState, useActionState } from "react"
import { MessageType, ToneType } from "@prisma/client"
import { 
    Send, MessageSquare, AlertCircle, Sparkles, 
    HelpCircle, Heart, CheckCircle2, Shield, Mic, Headphones, Loader2
} from "lucide-react"
import { sendMessage } from "@/lib/actions/message"
import type { MessageActionState } from "@/lib/actions/message"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import VoiceRecorder from "./VoiceRecorder"
import { Turnstile } from "@marsidev/react-turnstile"
import Logo from "@/components/shared/Logo"

interface MessagingFormProps {
  receiverId: string
  receiverName: string
}

type MessageMode = "TEXT" | "VOICE"

const MESSAGE_TYPES = [
  { id: MessageType.TEXT, icon: MessageSquare, label: "Text", color: "text-truth-accentBlue" },
  { id: MessageType.CONFESSION, icon: Logo, label: "Confession", color: "text-truth-accentRed" },
  { id: MessageType.QUESTION, icon: HelpCircle, label: "Question", color: "text-truth-accentGreen" },
  { id: MessageType.COMPLIMENT, icon: Heart, label: "Compliment", color: "text-truth-accentYellow" },
]

const TONES = [
  { id: ToneType.HONEST, label: "Honest", color: "bg-truth-accentGreen" },
  { id: ToneType.HARSH, label: "Harsh", color: "bg-truth-accentRed" },
  { id: ToneType.FUNNY, label: "Funny", color: "bg-amber-400" },
  { id: ToneType.DEEP, label: "Deep", color: "bg-purple-500" },
  { id: ToneType.NEUTRAL, label: "Neutral", color: "bg-truth-midGray" },
]

export default function MessagingForm({ receiverId, receiverName }: MessagingFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [activeType, setActiveType] = useState<MessageType>(MessageType.TEXT)
  const [manualTone, setManualTone] = useState<ToneType>(ToneType.NEUTRAL)
  const [revealSender, setRevealSender] = useState(false)
  const [mode, setMode] = useState<MessageMode>("TEXT")
  const [voiceData, setVoiceData] = useState<{ url: string, transcription: string } | null>(null)
  
  const [state, formAction, isPending] = useActionState<MessageActionState, FormData>(
    sendMessage,
    { status: "idle", message: "" }
  )
 
  const handleVoiceComplete = (url: string, transcription: string) => {
    setVoiceData({ url, transcription })
    setContent(transcription)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (isPending) return
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    formData.append("receiverId", receiverId)
    formData.append("type", mode === "VOICE" ? MessageType.VOICE : activeType)
    formData.append("tone", manualTone)
    formData.append("revealSender", revealSender.toString())
    
    if (mode === "VOICE" && voiceData) {
        formData.append("content", voiceData.transcription)
        formData.append("audioUrl", voiceData.url)
    }

    formAction(formData)
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative p-8 border-4 transition-all duration-500 overflow-hidden ${
        state.status === "success" ? "border-truth-accentGreen bg-truth-accentGreen/5" : "border-truth-midGray bg-truth-nearBlack"
      } shadow-[12px_12px_0px_rgba(255,51,102,0.1)]`}
    >
      <AnimatePresence mode="wait">
        {state.status === "success" ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 bg-truth-accentGreen rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,245,212,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-truth-bg" />
            </div>
            <div>
              <h3 className="font-bitter font-black text-3xl text-truth-textLight uppercase tracking-tighter">Signal_Transmitted</h3>
              <p className="font-mono text-xs text-truth-accentGreen mt-2 uppercase tracking-widest">Feedback loop established successfully.</p>
            </div>
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-truth-textLight text-truth-bg font-mono text-[10px] uppercase font-black tracking-widest hover:bg-white transition-all shadow-[6px_6px_0px_rgba(255,255,255,0.1)]"
            >
              Initialize_New_Signal
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Header with Mode Toggle */}
            <div className="flex items-center justify-between border-b border-truth-midGray pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${mode === "TEXT" ? "bg-truth-accentBlue" : "bg-truth-accentRed"}`} />
                <span className="font-mono text-[10px] font-black text-truth-textLight uppercase tracking-[0.3em]">
                  {mode}_SIGNAL_TRANSMITTER
                </span>
              </div>
              
              <div className="flex p-1 bg-truth-darkGray border border-truth-midGray rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode("TEXT")}
                  className={`p-2 transition-all rounded-md ${mode === "TEXT" ? "bg-truth-accentBlue text-white shadow-lg" : "text-truth-textGray hover:text-truth-textLight"}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMode("VOICE")}
                  className={`p-2 transition-all rounded-md ${mode === "VOICE" ? "bg-truth-accentRed text-white shadow-lg" : "text-truth-textGray hover:text-truth-textLight"}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
              {mode === "TEXT" ? (
                <motion.div
                  key="text-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative group"
                >
                  <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required={mode === "TEXT"}
                    placeholder={`Transmit an anonymous message to ${receiverName}...`}
                    className="w-full bg-truth-darkGray/30 border-2 border-truth-midGray p-6 font-mono text-sm text-truth-textLight min-h-[160px] focus:outline-none focus:border-truth-accentRed transition-all resize-none placeholder:text-truth-textGray/20"
                  />
                  <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                    <Sparkles className="w-24 h-24 text-truth-textLight" />
                  </div>
                  {/* Honeypot field (Spam Prevention) */}
                  <div className="absolute -top-10 left-0 h-0 w-0 overflow-hidden pointer-events-none">
                    <input type="text" name="nickname" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[9px] text-truth-textGray">
                    {content.length}/500
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="voice-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[160px] flex items-center justify-center bg-truth-darkGray/20 border-2 border-dashed border-truth-midGray"
                >
                  {voiceData ? (
                    <div className="p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 bg-truth-accentRed/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-truth-accentRed" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-1 tracking-widest">Decoded_Vibrations:</span>
                            <p className="font-bitter italic text-truth-textLight/70 text-sm">&ldquo;{voiceData.transcription}&rdquo;</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setVoiceData(null)}
                            className="px-4 py-1 border border-truth-midGray text-truth-textGray hover:text-truth-accentRed hover:border-truth-accentRed transition-all font-mono text-[8px] uppercase font-bold"
                        >
                            Recalibrate_Signal
                        </button>
                    </div>
                  ) : (
                    <div className="w-full">
                        <VoiceRecorder 
                            onComplete={handleVoiceComplete} 
                            onCancel={() => setMode("TEXT")} 
                        />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Config Section */}
            <div className="space-y-6 pt-4 border-t border-truth-midGray">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Types */}
                    {mode === "TEXT" && (
                        <div className="space-y-3">
                            <label className="block font-mono text-[9px] uppercase font-black text-truth-textGray tracking-widest">Protocol_Select</label>
                            <div className="flex flex-wrap gap-2">
                                {MESSAGE_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setActiveType(t.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-all font-mono text-[9px] uppercase font-bold
                                            ${activeType === t.id 
                                                ? "border-truth-textLight bg-truth-textLight text-truth-bg" 
                                                : "border-truth-midGray text-truth-textGray hover:border-truth-textLight hover:text-truth-textLight"}`}
                                    >
                                        <t.icon className="w-3 h-3" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tones */}
                    <div className="space-y-3">
                        <label className="block font-mono text-[9px] uppercase font-black text-truth-textGray tracking-widest">Signal_Tone</label>
                        <div className="flex flex-wrap gap-2">
                            {TONES.map(t => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setManualTone(t.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-all font-mono text-[9px] uppercase font-bold
                                        ${manualTone === t.id 
                                            ? `border-white ${t.color} text-white` 
                                            : "border-truth-midGray text-truth-textGray hover:border-truth-textLight hover:text-truth-textLight"}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full bg-white`} />
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Identity reveal */}
                {session?.user && (
                    <div className="flex items-center justify-between p-4 bg-truth-darkGray/30 border-2 border-truth-midGray group hover:border-truth-accentGreen transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 border-2 transition-all ${revealSender ? 'border-truth-accentGreen text-truth-accentGreen bg-truth-accentGreen/10 shadow-[0_0_15px_rgba(0,245,212,0.1)]' : 'border-truth-textGray text-truth-textGray'}`}>
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-mono text-[10px] font-black uppercase text-truth-textLight leading-none">Identity_Projection</h4>
                                <p className="font-mono text-[7px] text-truth-textGray uppercase mt-1">Include_Verified_Sender_ID</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={revealSender}
                                onChange={(e) => setRevealSender(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-truth-midGray peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-truth-accentGreen shadow-inner"></div>
                        </label>
                    </div>
                )}
                
                {/* Security Verification for Guests */}
                {!session?.user && (
                  <div className="pt-6 border-t border-truth-midGray flex flex-col items-center gap-3">
                    <label className="font-mono text-[9px] uppercase font-black text-truth-textGray tracking-widest text-center">Security_Verification: Required_for_Guest_Nodes</label>
                    <div className="bg-truth-darkGray/50 p-2 border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(0,0,0,0.4)]">
                        <Turnstile 
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                            options={{
                                theme: 'dark',
                            }}
                        />
                    </div>
                  </div>
                )}
            </div>

            {/* Error Message */}
            {state.status === "error" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-truth-accentRed/10 border-l-4 border-truth-accentRed"
              >
                <AlertCircle className="w-5 h-5 text-truth-accentRed" />
                <span className="font-mono text-[10px] text-truth-accentRed font-bold uppercase tracking-tight">{state.message}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || (mode === "TEXT" && !content) || (mode === "VOICE" && !voiceData)}
                className={`w-full py-5 relative group isolate overflow-hidden transition-all duration-500
                  ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:translate-y-1 active:shadow-none'}
                  ${mode === "TEXT" ? 'bg-truth-accentRed text-white' : 'bg-truth-textLight text-truth-bg shadow-[8px_8px_0px_rgba(255,255,255,0.1)]'}
                `}
              >
                <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10 bg-white`} />
                
                <div className="flex items-center justify-center gap-3 relative">
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-current" />
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest">
                        ENCRYPTING_PACKET...
                      </span>
                    </>
                  ) : (
                    <>
                      {mode === "TEXT" ? (
                        <>
                          <Send className="w-4 h-4 text-current transition-colors" />
                          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                            TRANSMIT_DATA_STREAM
                          </span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-4 h-4 text-current transition-colors" />
                          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                            DISPATCH_VOCAL_SIGNAL
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </button>
              
              <div className="flex items-center justify-center gap-8 mt-8 opacity-40">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <span className="font-mono text-[8px] uppercase">AES-256 E2E</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-truth-accentGreen" />
                  <span className="font-mono text-[8px] uppercase">Link_Secure</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </form>
  )
}
