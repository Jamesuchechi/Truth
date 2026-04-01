"use client"

import { signIn } from "next-auth/react"
import { Terminal, Globe } from "lucide-react"

export default function SocialLogins() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => signIn("google", { callbackUrl: "/feed" })}
        className="flex items-center justify-center gap-2 py-4 bg-truth-nearBlack border-2 border-truth-midGray hover:border-truth-accentRed transition-all font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-textLight group"
      >
        <Globe className="w-4 h-4 group-hover:text-truth-accentRed transition-colors" />
        Google Sync
      </button>
      <button
        onClick={() => signIn("github", { callbackUrl: "/feed" })}
        className="flex items-center justify-center gap-2 py-4 bg-truth-nearBlack border-2 border-truth-midGray hover:border-truth-accentRed transition-all font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-textLight group"
      >
        <Terminal className="w-4 h-4 group-hover:text-truth-accentRed transition-colors" />
        GitHub Access
      </button>
    </div>
  )
}
