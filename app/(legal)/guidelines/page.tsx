import React from "react"
import { Heart, ShieldCheck, AlertTriangle, Zap, Ghost } from "lucide-react"

export default function GuidelinesPage() {
  return (
    <article className="prose prose-invert prose-red max-w-none">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-truth-accentPurple/20 border-2 border-truth-accentPurple">
          <ShieldCheck className="w-8 h-8 text-truth-accentPurple" />
        </div>
        <h1 className="font-bitter text-5xl font-black uppercase tracking-tighter m-0">Protocol_Directives</h1>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-truth-accentPurple mb-12">
        Core_Directives: SAFETY // HONESTY // CONSENT
      </p>

      <section className="space-y-12">
        <div className="p-6 bg-truth-accentPurple/5 border-2 border-truth-accentPurple/20">
          <h2 className="text-xl font-black uppercase tracking-widest mt-0">01. Absolute_Authenticity</h2>
          <p className="text-gray-400 font-mono text-sm leading-relaxed mb-0">
            TRUTH is for radical honesty. Use your shadow identity to share what you cannot elsewhere. Do not use this protocol for deception, impersonation, or spreading misinformation for systemic harm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="border border-truth-midGray p-6 bg-truth-nearBlack">
            <Heart className="w-6 h-6 text-truth-accentRed mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Allowed Content</h3>
            <ul className="text-xs text-gray-500 font-mono space-y-2 list-none p-0">
              <li>• Personal confessions/struggles</li>
              <li>• Authentic feedback/critiques</li>
              <li>• Radical transparency</li>
              <li>• Deep human experiences</li>
            </ul>
          </div>
          <div className="border border-truth-midGray p-6 bg-truth-nearBlack">
            <AlertTriangle className="w-6 h-6 text-truth-accentYellow mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Hard Filters (NOT ALLOWED)</h3>
            <ul className="text-xs text-gray-500 font-mono space-y-2 list-none p-0">
              <li>• Doxxing (revealing real identities)</li>
              <li>• Targeted harassment/Bullying</li>
              <li>• Hate speech based on origin/identity</li>
              <li>• Illegal content/CSAM (Zero Tolerance)</li>
            </ul>
          </div>
        </div>

        <div>
           <h2 className="text-xl font-black uppercase tracking-widest border-b border-truth-midGray pb-4 flex items-center gap-2">
             <Zap className="w-5 h-5 text-truth-accentRed" /> Enforcement_Hierarchy
           </h2>
           <div className="space-y-4 mt-6">
              {[
                { level: "01_FILTER", action: "Signal is masked from general view, visible only to author." },
                { level: "02_QUARANTINE", action: "Node is isolated. Reputation score falls dramatically." },
                { level: "03_TERMINATION", action: "Permanent blacklist of the shadow node in the protocol." }
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start p-4 bg-truth-bg/50 border border-truth-midGray/30">
                  <span className="font-mono text-xs font-black text-truth-accentPurple">{step.level}</span>
                  <p className="font-mono text-[10px] text-gray-400 m-0">{step.action}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-truth-accentRed/5 p-8 border-2 border-dashed border-truth-accentRed/30 text-center">
            <Ghost className="w-12 h-12 text-truth-accentRed opacity-20 mx-auto mb-4" />
            <h2 className="text-sm font-black uppercase tracking-widest mt-0">Don&apos;t be a Ghost of Harm</h2>
            <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-lg mx-auto">
              If your signal makes the network toxic, the protocol will automatically eject you. Protect the space for those who need it.
            </p>
        </div>
      </section>

      <footer className="mt-24 pt-12 border-t border-truth-midGray">
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          SYNC_COMPLETE: Respect the directives or face protocol termination.
        </p>
      </footer>
    </article>
  )
}
