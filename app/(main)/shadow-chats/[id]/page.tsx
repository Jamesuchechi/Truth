// app/(main)/shadow-chats/[id]/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getConversationMessages, getShadowConversations } from "@/lib/actions/shadowChatActions"
import ChatClient from "./ChatClient"
import Link from "next/link"
import { ChevronLeft, Shield } from "lucide-react"

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ConversationPage({ params }: Props) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const messages = await getConversationMessages(id)
    const conversations = await getShadowConversations()
    const currentConv = conversations.find(c => c.id === id)

    if (!currentConv) redirect("/shadow-chats")

    return (
        <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col h-[calc(100vh-80px)]">
            <header className="mb-8 flex items-center justify-between border-b-2 border-truth-midGray pb-6">
                <div className="flex items-center gap-6">
                    <Link href="/shadow-chats" className="p-2 border-2 border-truth-midGray text-truth-textGray hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bitter font-black text-3xl text-truth-textLight uppercase tracking-tight italic">
                            {currentConv.name || (currentConv.type === "DIRECT" ? "Secure_Signal" : "Group_Frequency")}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-[9px] text-truth-accentGreen uppercase flex items-center gap-1 font-black underline">
                                <div className="w-1.5 h-1.5 rounded-full bg-truth-accentGreen animate-pulse" /> Channel_LIVE
                            </span>
                            <span className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest font-black">Link ID: {id.substring(0, 12)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="font-mono text-[8px] text-truth-textGray uppercase font-black">ENCRYPT_LEVEL: 10</span>
                        <span className="font-mono text-[8px] text-truth-accentBlue uppercase font-black tracking-widest">Protocol: Ghost_V2</span>
                    </div>
                    <div className="p-3 bg-truth-accentBlue/10 border-2 border-truth-accentBlue text-truth-accentBlue">
                        <Shield className="w-5 h-5" />
                    </div>
                </div>
            </header>

            <ChatClient 
                conversationId={id} 
                initialMessages={messages} 
                currentUserId={session.user.id}
            />
        </div>
    )
}
