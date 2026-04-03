import { Terminal as TerminalIcon } from "lucide-react"
import { getInboxThreads } from "@/lib/actions/messageActions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import InboxClient from "./InboxClient"

export default async function InboxPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const messages = await getInboxThreads()
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <header className="mb-12 sm:mb-16 relative">
        <div className="flex items-end justify-between border-b-4 border-truth-midGray pb-6 flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="font-bitter font-black text-5xl sm:text-6xl text-truth-textLight tracking-tighter uppercase leading-none">
              INBOX<span className="text-truth-accentRed">.SYS</span>
            </h1>
            <p className="font-mono text-[10px] sm:text-xs text-truth-textGray uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-3 flex items-center gap-2">
              <TerminalIcon className="w-3 h-3 text-truth-accentRed shrink-0" /> SECURE_COMMS_LINK: ESTABLISHED
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse" />
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse opacity-50" />
            </div>
            <span className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest font-black">ENCRYPTION: AES-256</span>
          </div>
        </div>
      </header>

      <InboxClient initialMessages={messages} />
    </div>
  )
}
