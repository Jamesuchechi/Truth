// app/(main)/shadow-chats/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getShadowConversations } from "@/lib/actions/shadowChatActions"
import ChatListClient from "./ChatListClient"
import { Ghost, MessageSquarePlus } from "lucide-react"

export default async function ShadowChatsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const conversations = await getShadowConversations()

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            <header className="mb-12 flex items-end justify-between border-b-4 border-truth-midGray pb-6">
                <div>
                    <h1 className="font-bitter font-black text-6xl text-truth-textLight tracking-tighter uppercase leading-none">
                        CHATS<span className="text-truth-accentBlue">.SYS</span>
                    </h1>
                    <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                        <Ghost className="w-3 h-3 text-truth-accentBlue" /> ADVANCED_SHADOW_COMM_CHANNEL
                    </p>
                </div>
                
                <button className="flex items-center gap-2 p-3 bg-truth-accentBlue/10 border-2 border-truth-accentBlue text-truth-accentBlue hover:bg-truth-accentBlue hover:text-white transition-all font-mono text-[10px] uppercase font-black shadow-[8px_8px_0px_rgba(0,187,249,0.1)]">
                    <MessageSquarePlus className="w-4 h-4" />
                    New_Secure_Link
                </button>
            </header>

            <ChatListClient initialConversations={conversations} />
        </div>
    )
}
