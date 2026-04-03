import React from "react"
import { Shield, EyeOff, Lock } from "lucide-react"

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert prose-red max-w-none">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-truth-accentRed/20 border-2 border-truth-accentRed">
          <Shield className="w-8 h-8 text-truth-accentRed" />
        </div>
        <h1 className="font-bitter text-5xl font-black uppercase tracking-tighter m-0">Privacy_Protocol</h1>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-truth-accentRed mb-12">
        Effective_Date: April 03, 2026 // Last_Sync: 11:45 UTC
      </p>

      <section className="space-y-8">
        <div className="p-6 bg-truth-darkGray/50 border-l-4 border-truth-accentRed">
          <h2 className="text-xl font-black uppercase tracking-widest mt-0">01. Zero_Knowledge_Foundation</h2>
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            TRUTH is built on the philosophy of radical honesty and absolute anonymity. We do not sell, rent, or trade your personal data. Our business model is not supported by surveillance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="border border-truth-midGray p-6">
            <EyeOff className="w-6 h-6 text-truth-accentPurple mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">What We Never See</h3>
            <ul className="text-xs text-gray-500 font-mono space-y-2 list-none p-0">
              <li>• Your real identity (unless you choose to reveal it)</li>
              <li>• Your contacts or private messages (End-to-End Encrypted)</li>
              <li>• Your browsing history outside the TRUTH protocol</li>
            </ul>
          </div>
          <div className="border border-truth-midGray p-6">
            <Lock className="w-6 h-6 text-truth-accentBlue mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">How We Secure You</h3>
            <ul className="text-xs text-gray-500 font-mono space-y-2 list-none p-0">
              <li>• Distributed Shadow Identity system</li>
              <li>• Periodic signal flushing</li>
              <li>• Metadata stripping on all transmissions</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">02. Data_Transmission</h2>
          <p className="text-gray-400">
            When you emit a signal on the TRUTH network, we store the content and its associated shadow identity. This data is used solely to facilitate the protocol&apos;s core functionality: radical transparency.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-widest">03. Autonomous_Moderation</h2>
          <p className="text-gray-400">
            Our AI layer scans signals for violations of the core human directive (Safety/Consent). This processing happens locally where possible and is designed to protect the network without compromising individual anonymity.
          </p>
        </div>
      </section>

      <footer className="mt-24 pt-12 border-t border-truth-midGray">
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          SYNC_COMPLETE: You are now informed of the protocol&apos;s privacy stance.
        </p>
      </footer>
    </article>
  )
}
