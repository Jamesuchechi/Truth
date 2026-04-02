"use client"

import { useState, useRef, useTransition } from "react"
import { MessageType, ToneType } from "@prisma/client"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { 
    MessageSquare, Zap, HelpCircle, Heart, 
    Star, Archive, Reply as ReplyIcon, ChevronDown, CheckCircle2,
    Shield, Ban, Loader2, Play, Pause, Volume2, Headphones, Trash2,
    type LucideIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toggleFavorite, toggleArchive, blockSender, deleteMessage } from "@/lib/actions/messageActions"
import type { Message } from "@/lib/types/message"

interface MessageItemProps {
  message: Message
  isSelected?: boolean
  onSelect?: (id: string) => void
  isSelectMode?: boolean
}

const TYPE_CONFIG: Record<string, { icon: LucideIcon, color: string, bg: string }> = {
  [MessageType.TEXT]: { icon: MessageSquare, color: "text-truth-accentBlue", bg: "bg-truth-accentBlue/10" },
  [MessageType.CONFESSION]: { icon: Zap, color: "text-truth-accentRed", bg: "bg-truth-accentRed/10" },
  [MessageType.QUESTION]: { icon: HelpCircle, color: "text-truth-accentGreen", bg: "bg-truth-accentGreen/10" },
  [MessageType.COMPLIMENT]: { icon: Heart, color: "text-truth-accentYellow", bg: "bg-truth-accentYellow/10" },
  [MessageType.VOICE]: { icon: Headphones, color: "text-truth-accentRed", bg: "bg-truth-accentRed/10" },
}

const TONE_CONFIG: Record<string, { label: string, color: string, text: string }> = {
  [ToneType.HONEST]: { label: "Honest", color: "bg-truth-accentGreen", text: "text-truth-accentGreen" },
  [ToneType.HARSH]: { label: "Harsh", color: "bg-truth-accentRed", text: "text-truth-accentRed" },
  [ToneType.FUNNY]: { label: "Funny", color: "bg-amber-400", text: "text-amber-400" },
  [ToneType.DEEP]: { label: "Deep", color: "bg-purple-500", text: "text-purple-500" },
  [ToneType.NEUTRAL]: { label: "Neutral", color: "bg-truth-midGray", text: "text-truth-textGray" },
}

export default function MessageItem({ message, isSelected, onSelect, isSelectMode }: MessageItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isActionsLoading, startTransition] = useTransition()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const config = TYPE_CONFIG[message.type] || TYPE_CONFIG[MessageType.TEXT]
  const toneConfig = message.tone ? TONE_CONFIG[message.tone] : TONE_CONFIG[ToneType.NEUTRAL]
  const Icon = config.icon

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
        await toggleFavorite(message.id)
    })
  }

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
        await toggleArchive(message.id)
    })
  }

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const handleBlock = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Block this sender fingerprint permanently?")) {
        startTransition(async () => {
            await blockSender(message.id)
        })
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Purge this transmission from the buffer?")) {
        startTransition(async () => {
            await deleteMessage(message.id)
        })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative border-2 transition-all duration-300 overflow-hidden
        ${isSelected ? "border-truth-accentRed bg-truth-accentRed/5" : "border-truth-midGray bg-truth-nearBlack hover:border-truth-textGray"}
        ${!message.readAt ? "border-l-8 border-l-truth-accentRed" : ""}`}
      onClick={() => {
        if (isSelectMode) onSelect?.(message.id)
        else setIsExpanded(!isExpanded)
      }}
    >
      <div className="flex items-stretch min-h-[100px]">
        {/* Selection Strip */}
        <div 
          className={`w-12 flex items-center justify-center border-r border-truth-midGray transition-colors ${isSelected ? "bg-truth-accentRed text-truth-bg" : "bg-truth-nearBlack text-truth-textGray group-hover:bg-truth-darkGray"}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(message.id)
          }}
        >
          {isSelected ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <div className={`w-4 h-4 border-2 border-current transition-all ${isSelectMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border border-current ${toneConfig.text}`}>
                {toneConfig.label}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-truth-textGray uppercase">
                <Icon className={`w-3 h-3 ${config.color}`} />
                {message.type}
              </div>
              <span className="font-mono text-[9px] text-truth-textGray/40">
                {formatDistanceToNow(new Date(message.createdAt))} ago
              </span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={handleToggleFavorite}
                disabled={isActionsLoading}
                className={`p-1.5 transition-colors ${message.isFavorite ? "text-truth-accentYellow" : "text-truth-textGray hover:text-truth-accentYellow"}`}
               >
                 <Star className={`w-4 h-4 ${message.isFavorite ? "fill-current" : ""}`} />
               </button>
               <button 
                onClick={handleToggleArchive}
                disabled={isActionsLoading}
                className={`p-1.5 transition-colors ${message.isArchived ? "text-truth-accentBlue" : "text-truth-textGray hover:text-truth-accentBlue"}`}
               >
                 <Archive className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <p className={`font-bitter text-sm line-clamp-1 flex-1 ${!message.readAt ? "text-truth-textLight font-bold" : "text-truth-textGray"}`}>
              {message.type === MessageType.VOICE ? "[SECURE_VOCAL_SIGNAL]" : message.content}
            </p>
            {message.type === MessageType.VOICE && (
                <div className="px-2 py-0.5 bg-truth-accentRed/10 border border-truth-accentRed/30 rounded-full animate-pulse flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-truth-accentRed" />
                    <span className="font-mono text-[7px] text-truth-accentRed font-black uppercase">Encoded</span>
                </div>
            )}
          </div>
        </div>

        {/* Expand Toggle */}
        <div className="w-12 border-l border-truth-midGray flex items-center justify-center bg-truth-darkGray/10">
            <button className={`p-3 text-truth-textGray hover:text-truth-textLight transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                <ChevronDown className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-truth-midGray bg-black/40"
          >
            <div className="p-8 space-y-8">
              {/* Origin Section */}
              <div className="flex items-center justify-between p-4 bg-truth-darkGray/30 border border-truth-midGray">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center overflow-hidden">
                       {message.revealSender && message.sender ? (
                          <Image 
                            src={message.sender.image || "/avatar-placeholder.png"} 
                            alt="Sender" 
                            width={48} 
                            height={48} 
                            className="w-full h-full object-cover"
                          />
                       ) : (
                          <Shield className="w-6 h-6 text-truth-textGray" />
                       )}
                    </div>
                    <div>
                        <span className="font-mono text-[9px] text-truth-textGray uppercase block mb-1">Signal_Origin:</span>
                        <h4 className="font-mono text-xs font-black text-truth-textLight uppercase tracking-tighter">
                            {message.revealSender && message.sender ? message.sender.username : "ANONYMOUS_FREQUENCE"}
                        </h4>
                    </div>
                 </div>
                 
                 {!message.revealSender && (
                    <button 
                        onClick={handleBlock}
                        disabled={isActionsLoading}
                        className="px-4 py-2 border border-truth-accentRed/30 text-truth-accentRed/60 hover:bg-truth-accentRed hover:text-white transition-all font-mono text-[8px] uppercase font-black flex items-center gap-2"
                    >
                        {isActionsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                        Block_Source
                    </button>
                 )}
              </div>

              {/* Translation/Playback Area */}
              <div className="space-y-4">
                 <span className="font-mono text-[9px] text-truth-textGray uppercase tracking-[0.4em] block">Payload_Decryption:</span>
                 
                 {message.type === MessageType.VOICE ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-truth-nearBlack border-2 border-truth-accentRed/30 flex items-center gap-6">
                            <button 
                                onClick={handleAudioToggle}
                                className="w-16 h-16 bg-truth-accentRed text-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,51,102,0.3)] hover:scale-105 transition-all"
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>
                            <div className="flex-1 space-y-2">
                                <div className="h-1.5 w-full bg-truth-midGray rounded-full overflow-hidden">
                                     <motion.div 
                                        className="h-full bg-truth-accentRed"
                                        animate={{ width: isPlaying ? "100%" : "0%" }}
                                        transition={{ duration: 30, ease: "linear" }}
                                     />
                                </div>
                                <div className="flex justify-between font-mono text-[8px] text-truth-textGray uppercase">
                                    <span>Signal_Waveform</span>
                                    <span>Vocal_Stream</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-truth-darkGray/20 p-6 border-l-4 border-truth-accentRed/50">
                            <span className="font-mono text-[8px] text-truth-textGray uppercase block mb-2">Neural_Transcription:</span>
                            <p className="font-bitter italic text-lg text-truth-textLight leading-relaxed">
                                &ldquo;{message.transcription || message.content || "[Decoding_In_Progress]"}&rdquo;
                            </p>
                        </div>
                        <audio 
                            ref={audioRef}
                            src={message.audioUrl || ""}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                        />
                    </div>
                 ) : (
                    <p className="font-bitter text-xl text-truth-textLight leading-relaxed">
                        {message.content}
                    </p>
                 )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-truth-midGray">
                 <button className="flex-1 bg-truth-textLight text-truth-bg py-4 font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
                    <ReplyIcon className="w-4 h-4" />
                    Transmit_Response
                 </button>
                 <button 
                    onClick={handleDelete}
                    disabled={isActionsLoading}
                    className="p-4 border-2 border-truth-midGray text-truth-textGray hover:text-truth-accentRed hover:border-truth-accentRed transition-all"
                 >
                    {isActionsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
