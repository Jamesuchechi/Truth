import Link from "next/link"
import type { Metadata } from "next"
import { Terminal, ArrowLeft, Ghost, Radio } from "lucide-react"
import Footer from "@/components/shared/Footer"

export const metadata: Metadata = {
  title: "404 // SIGNAL_LOST | TRUTH",
  description: "The signal you are looking for does not exist in this reality. Return to the TRUTH protocol.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-10">

        <div className="relative">
          <div className="relative inline-block">
            <span className="font-bitter font-black text-[8rem] sm:text-[12rem] leading-none opacity-5 select-none absolute inset-0 translate-x-1 translate-y-1 text-truth-accentRed">
              404
            </span>
            <span className="font-bitter font-black text-[8rem] sm:text-[12rem] leading-none opacity-5 select-none relative text-foreground">
              404
            </span>
          </div>
        </div>

        {/* Ghost Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-card border-2 border-border flex items-center justify-center rotate-12 shadow-[4px_4px_0px_rgba(255,51,102,0.2)]">
            <Ghost className="w-10 h-10 text-truth-accentRed/60 -rotate-12 animate-pulse" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-truth-accentRed/10 border border-truth-accentRed/30">
            <Radio className="w-3 h-3 text-truth-accentRed animate-pulse" />
            <span className="font-mono text-[9px] text-truth-accentRed uppercase font-black tracking-widest">
              SIGNAL_LOST // NODE_UNREACHABLE
            </span>
          </div>

          <h1 className="font-bitter font-black text-2xl sm:text-4xl uppercase tracking-tighter text-foreground">
            TRANSMISSION_NOT_FOUND
          </h1>

          <p className="font-mono text-xs text-muted uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
            The signal you requested does not exist in the current protocol layer. It may have been terminated, archived, or never emitted.
          </p>
        </div>

        {/* Terminal Output */}
        <div className="bg-card border-2 border-border p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 mb-3 border-b border-border pb-3">
            <Terminal className="w-3 h-3 text-truth-accentRed" />
            <span className="font-mono text-[8px] text-muted uppercase tracking-widest">SYSTEM_DIAGNOSTICS</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px]">
            <p className="text-muted"><span className="text-truth-accentRed">ERR </span>Route resolution failed</p>
            <p className="text-muted"><span className="text-truth-accentYellow">WARN</span> Signal ID not in active registry</p>
            <p className="text-muted"><span className="text-truth-accentBlue">INFO</span> Suggest: Return to broadcast origin</p>
            <p className="text-truth-accentGreen animate-pulse">▋ Awaiting user input...</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/feed"
            className="group flex items-center gap-2 px-6 py-3 bg-truth-accentRed text-white font-mono text-[10px] uppercase font-black tracking-widest hover:bg-truth-accentRed/90 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 w-full sm:w-auto justify-center"
          >
            <Radio className="w-3.5 h-3.5" />
            RETURN_TO_FEED
          </Link>

          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 border-2 border-border text-muted font-mono text-[10px] uppercase font-black tracking-widest hover:border-foreground hover:text-foreground transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            SIGNAL_ORIGIN
          </Link>
        </div>

        {/* Footer */}
        <p className="font-mono text-[8px] text-muted/40 uppercase tracking-[0.4em]">
          TRUTH_PROTOCOL // HTTP_404 // NODE_OFFLINE
        </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
