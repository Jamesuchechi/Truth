// app/(main)/shadow-chats/[id]/ChatClient.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Ghost, User, ShieldCheck, Sparkles } from "lucide-react"
import { sendShadowChatMessage } from "@/lib/actions/shadowChatActions"
import type { Message } from "@prisma/client"

type MessageWithSender = Message & {
    sender: {
        username: string
        shadowName: string | null
        image: string | null
    } | null
}

interface ChatClientProps {
  conversationId: string
  initialMessages: MessageWithSender[]
  currentUserId: string
}

export default function ChatClient({ conversationId, initialMessages, currentUserId }: ChatClientProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [content, setContent] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        const optimisticMessage: MessageWithSender = {
            id: Date.now().toString(),
            content,
            senderId: currentUserId,
            receiverId: null,
            type: "TEXT",
            tone: null,
            senderEmail: null,
            senderName: null,
            createdAt: new Date(),
            readAt: null,
            deletedAt: null,
            isArchived: false,
            isFavorite: false,
            revealSender: false,
            senderFingerprint: null,
            repliedWithPostId: null,
            parentId: null,
            audioUrl: null,
            transcription: null,
            isRestored: false,
            conversationId,
            sender: {
                username: "Me",
                shadowName: "Me",
                image: null
            }
        }

        setMessages(prev => [...prev, optimisticMessage])
        const text = content
        setContent("")

        try {
            const result = await sendShadowChatMessage(conversationId, text)
            // Update the optimistic message with the real data
            const syncedMessage: MessageWithSender = {
                ...result,
                sender: optimisticMessage.sender
            }
            setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? syncedMessage : m))
        } catch (error) {
            console.error("Message failed to sync:", error)
            // Handle error (e.g., show red border)
        }
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-truth-nearBlack/20 border-x-2 border-b-2 border-truth-midGray shadow-[20px_20px_60px_rgba(0,0,0,0.5)]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <Ghost className="w-16 h-16 text-truth-textGray mb-4" />
                        <span className="font-mono text-xs uppercase tracking-widest text-truth-textGray">Silence_Detected // Initialize_Dialogue</span>
                    </div>
                )}
                
                {messages.map((msg, idx) => {
                    const isOwn = msg.senderId === currentUserId
                    const prevMsg = messages[idx - 1]
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId

                    return (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end gap-3`}
                        >
                            {!isOwn && (
                                <div className={`w-8 h-8 ${showAvatar ? "opacity-100" : "opacity-0"} bg-truth-accentBlue/20 border border-truth-accentBlue text-truth-accentBlue flex items-center justify-center shrink-0`}>
                                    <User className="w-4 h-4" />
                                </div>
                            )}
                            
                            <div className={`max-w-[70%] space-y-1`}>
                                {showAvatar && (
                                    <span className={`font-mono text-[8px] uppercase font-black tracking-widest ${isOwn ? "text-truth-accentBlue text-right block" : "text-truth-textGray"}`}>
                                        {msg.sender?.shadowName || "Shadow_Node"} <span className="opacity-20 text-[6px]">||</span> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                                <div className={`p-4 border-2 transition-all ${
                                    isOwn 
                                        ? "bg-truth-accentBlue/5 border-truth-accentBlue text-truth-textLight shadow-[4px_4px_0px_rgba(0,187,249,0.1)]" 
                                        : "bg-truth-darkGray/40 border-truth-midGray text-truth-textLight/90"
                                }`}>
                                    <p className="font-mono text-xs leading-relaxed wrap-break-word">{msg.content}</p>
                                </div>
                                {isOwn && <ShieldCheck className="w-2 h-2 text-truth-accentBlue ml-auto opacity-30" />}
                            </div>

                            {isOwn && (
                                <div className={`w-8 h-8 ${showAvatar ? "opacity-100" : "opacity-0"} bg-truth-accentBlue/20 border border-truth-accentBlue text-truth-accentBlue flex items-center justify-center shrink-0`}>
                                    <Ghost className="w-4 h-4" />
                                </div>
                            )}
                        </motion.div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-truth-nearBlack border-t-4 border-truth-midGray glass-effect">
                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute inset-0 bg-truth-accentBlue opacity-0 group-focus-within:opacity-[0.02] transition-opacity pointer-events-none" />
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend(e)
                                    }
                                }}
                                placeholder="Transmit_Signal_Packet..."
                                className="w-full bg-truth-darkGray/50 border-2 border-truth-midGray p-4 pr-12 font-mono text-xs text-truth-textLight focus:outline-none focus:border-truth-accentBlue transition-all resize-none h-14 overflow-hidden placeholder:opacity-20"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none scale-75">
                                <Sparkles className="w-5 h-5 text-truth-accentBlue" />
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={!content.trim()}
                            className="p-4 bg-truth-accentBlue text-white hover:bg-white hover:text-truth-bg transition-all shadow-[8px_8px_0px_rgba(0,187,249,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
