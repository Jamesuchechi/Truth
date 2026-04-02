// app/(main)/shadow-chats/ChatListClient.tsx
"use client"

import { useState } from "react"
import type { Conversation, Message, ConversationParticipant } from "@prisma/client"
import Link from "next/link"
import { Users, User as UserIcon, MessageCircle } from "lucide-react"

type ConversationWithParticipants = Conversation & {
    participants: (ConversationParticipant & {
        user: {
            username: string
            shadowName: string | null
            image: string | null
        }
    })[]
    messages: (Message & {
        sender: {
            username: string
            shadowName: string | null
        } | null
    })[]
}

interface ChatListClientProps {
    initialConversations: ConversationWithParticipants[]
}

export default function ChatListClient({ initialConversations }: ChatListClientProps) {
    const [conversations] = useState(initialConversations)

    if (conversations.length === 0) {
        return (
            <div className="py-24 text-center border-4 border-dashed border-truth-midGray bg-truth-nearBlack/20">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center rotate-45">
                        <MessageCircle className="w-10 h-10 text-truth-textGray/40 -rotate-45" />
                    </div>
                </div>
                <h2 className="font-bitter font-black text-2xl text-truth-textLight uppercase tracking-tighter">NO_ACTIVE_THREADS</h2>
                <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
                    Awaiting encrypted handshake. No active shadow conversations detected on current frequency.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {conversations.map((conv, idx) => {
                const isGroup = conv.type === "GROUP"
                const lastMessage = conv.messages[0]

                return (
                    <Link 
                        key={conv.id}
                        href={`/shadow-chats/${conv.id}`}
                        className="group block p-8 bg-truth-nearBlack border-2 border-truth-midGray hover:border-truth-accentBlue transition-all shadow-[12px_12px_0px_rgba(0,187,249,0.05)]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 ${isGroup ? "bg-truth-accentBlue/10 text-truth-accentBlue" : "bg-truth-accentRed/10 text-truth-accentRed"} border-2 border-current flex items-center justify-center`}>
                                    {isGroup ? <Users className="w-8 h-8" /> : <UserIcon className="w-8 h-8" />}
                                </div>
                                
                                <div>
                                    <h3 className="font-bitter font-black text-2xl text-truth-textLight group-hover:text-truth-accentBlue transition-colors uppercase italic tracking-tight">
                                        {conv.name || (isGroup ? "Group Signal" : "Direct Relay")}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-truth-accentGreen animate-pulse" />
                                        <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest">
                                            {isGroup ? `${conv.participants.length} Active Nodes` : `Secured_${idx + 1}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <span className="font-mono text-[8px] text-truth-textGray uppercase font-black">Link_EST: {new Date(conv.updatedAt).toLocaleDateString()}</span>
                                <span className="font-mono text-[8px] text-truth-accentBlue animate-pulse uppercase font-black">ENCRYPTED</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-truth-darkGray/20 border-l-4 border-truth-midGray group-hover:border-truth-accentBlue transition-colors">
                            <p className="font-mono text-xs text-truth-textGray uppercase italic line-clamp-1">
                                {lastMessage ? (
                                    <>
                                        <span className="text-truth-textLight not-italic font-black">
                                            {lastMessage.sender?.shadowName || "Shadow_Node"}:
                                        </span> {lastMessage.content}
                                    </>
                                ) : "System: Secure link standby. Ready for transmission..."}
                            </p>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
