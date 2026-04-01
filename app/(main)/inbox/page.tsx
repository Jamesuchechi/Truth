import { Terminal as TerminalIcon, Inbox as InboxIcon } from "lucide-react"

export default async function InboxPage() {
  
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <header className="mb-16 relative">
        <div className="flex items-end justify-between border-b-4 border-truth-midGray pb-6">
          <div>
            <h1 className="font-bitter font-black text-6xl text-truth-textLight tracking-tighter uppercase leading-none">
              INBOX<span className="text-truth-accentRed">.SYS</span>
            </h1>
            <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              <TerminalIcon className="w-3 h-3 text-truth-accentRed" /> SECURE_COMMS_LINK: ESTABLISHED
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse" />
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse opacity-50" />
            </div>
            <span className="font-mono text-[9px] text-truth-textGray uppercase">ENCRYPTION: AES-256</span>
          </div>
        </div>
      </header>

      <div className="py-24 text-center border-4 border-dashed border-truth-midGray bg-truth-darkGray/30">
         <div className="mb-6 flex justify-center">
           <div className="w-20 h-20 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center rotate-45">
             <InboxIcon className="w-10 h-10 text-truth-textGray/40 -rotate-45" />
           </div>
         </div>
         <h2 className="font-bitter font-black text-2xl text-truth-textLight uppercase tracking-tighter">NO TRANSMISSIONS</h2>
         <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
           The secure channel is clear. No incoming data packets detected.
         </p>
      </div>
    </div>
  )
}
