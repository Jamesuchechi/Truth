import React from "react"
import { Scale, FileText, Gavel } from "lucide-react"

export default function TermsPage() {
  return (
    <article className="prose prose-invert prose-red max-w-none">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-truth-accentBlue/20 border-2 border-truth-accentBlue">
          <Scale className="w-8 h-8 text-truth-accentBlue" />
        </div>
        <h1 className="font-bitter text-5xl font-black uppercase tracking-tighter m-0">Terms_of_Signal</h1>
      </div>

      <p className="font-mono text-xs uppercase tracking-widest text-truth-accentBlue mb-12">
        System_Revision: 1.0.0 // Node_Authority: GLOBAL
      </p>

      <section className="space-y-12">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest border-b border-truth-midGray pb-4">01. Acceptance_of_Protocol</h2>
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            By accessing or emitting signals on the TRUTH network, you agree to abide by the decentralized protocols set forth in this document. If you do not agree with the radical transparency mandate, you must disconnect immediately.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase tracking-widest border-b border-truth-midGray pb-4">02. Shadow_Identity_Responsibility</h2>
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            While your real-world identity is shielded, you are fully responsible for the signals emitted from your shadow node. Abuse of the anonymity layer for harassment, illegal activity, or system sabotage results in immediate signal termination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="border border-truth-midGray p-6 bg-truth-nearBlack">
            <FileText className="w-6 h-6 text-truth-accentGreen mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Platform Rights</h3>
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              We grant you a non-exclusive, revocable license to utilize the TRUTH signaling interface. We do not own your truths; you retain all authorship over your emitted signals.
            </p>
          </div>
          <div className="border border-truth-midGray p-6 bg-truth-nearBlack">
            <Gavel className="w-6 h-6 text-truth-accentRed mb-4" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Enforcement</h3>
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              Violation of the Community Guidelines results in automatic protocol enforcement: filtering, quarantine, or permanent node blacklisting.
            </p>
          </div>
        </div>

        <div>
           <h2 className="text-xl font-black uppercase tracking-widest border-b border-truth-midGray pb-4">03. System_Stability</h2>
           <p className="text-gray-400 font-mono text-sm leading-relaxed">
             The TRUTH network is provided &quot;AS IS&quot;. We do not guarantee the persistence of any signal or the constant availability of the decryption layer.
           </p>
        </div>
      </section>

      <footer className="mt-24 pt-12 border-t border-truth-midGray">
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          PROTOCOL_ACCEPTED: Proceed with radical honesty.
        </p>
      </footer>
    </article>
  )
}
