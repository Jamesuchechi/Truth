"use client"

import { useState, useTransition } from "react"
import { getSecurityQuestion, verifySecurityAnswer, resetPassword } from "@/lib/actions/user"
import Link from "next/link"
import { ArrowRight, Loader2, Mail, ShieldQuestion, Lock, CheckCircle2, AlertCircle, Terminal } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"IDENTIFY" | "CHOOSE" | "QUESTION" | "SUCCESS">("IDENTIFY")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleIdentify = () => {
    setError("")
    startTransition(async () => {
      const res = await getSecurityQuestion(email)
      if (res.question) {
        setQuestion(res.question)
        setStep("CHOOSE")
      } else {
        // No question set, fall back to email only
        handleEmailReset()
      }
    })
  }

  const handleEmailReset = () => {
    setError("")
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", email)
      const res = await resetPassword({}, formData)
      if (res.success) setStep("SUCCESS")
      else setError(res.error as string)
    })
  }

  const handleQuestionVerify = () => {
    setError("")
    startTransition(async () => {
      const res = await verifySecurityAnswer(email, answer)
      if (res.success && res.token) {
        // Redirect to new-password with the token
        window.location.href = `/auth/new-password?token=${res.token}`
      } else {
        setError(res.error as string)
      }
    })
  }

  return (
    <main className="min-h-screen bg-truth-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #FF3366 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-md p-10 bg-truth-nearBlack border-2 border-truth-midGray shadow-[20px_20px_0px_rgba(255,51,102,0.1)] relative z-10 animate-fadeIn">
        <div className="mb-10 text-center">
          <Terminal className="w-10 h-10 text-truth-accentRed mx-auto mb-4" />
          <h1 className="font-bitter text-4xl font-black text-truth-textLight uppercase tracking-tighter mb-2">
            Identity Recovery
          </h1>
          <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.3em]">Protocol: Security Override</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {step === "IDENTIFY" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block font-mono text-[10px] uppercase tracking-[0.4em] text-truth-textGray ml-1">Identity Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-5 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
                  placeholder="you@truth.network"
                />
              </div>
            </div>
            <button
              onClick={handleIdentify}
              disabled={isPending || !email}
              className="w-full py-5 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Initiate Lookup <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {step === "CHOOSE" && (
          <div className="space-y-6">
            <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest text-center leading-relaxed">
              Multiple recovery protocols detected. Choose your bypass method:
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleEmailReset}
                className="w-full p-6 border-2 border-truth-midGray hover:border-truth-accentRed transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-truth-textGray group-hover:text-truth-accentRed" />
                  <div>
                    <h3 className="font-bitter text-lg font-black text-truth-textLight uppercase">Standard Sync</h3>
                    <p className="font-mono text-[8px] text-truth-textGray uppercase">Decrypt via Email link</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setStep("QUESTION")}
                className="w-full p-6 border-2 border-truth-midGray hover:border-truth-accentRed transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <ShieldQuestion className="w-6 h-6 text-truth-textGray group-hover:text-truth-accentRed" />
                  <div>
                    <h3 className="font-bitter text-lg font-black text-truth-textLight uppercase">Cognitive Override</h3>
                    <p className="font-mono text-[8px] text-truth-textGray uppercase">Security Question Challenge</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "QUESTION" && (
          <div className="space-y-8">
            <div className="p-4 bg-truth-accentRed/5 border-l-4 border-truth-accentRed">
               <h3 className="font-mono text-[8px] uppercase tracking-widest text-truth-accentRed mb-2 font-bold">Encrypted Challenge</h3>
               <p className="font-bitter text-xl font-black text-truth-textLight uppercase italic">
                 {question.replace(/_/g, ' ')}?
               </p>
            </div>
            <div className="space-y-4">
              <label className="block font-mono text-[10px] uppercase tracking-[0.4em] text-truth-textGray ml-1">Answer Protocol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
                <input
                  type="password"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-5 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
                  placeholder="Decrypting sequence..."
                />
              </div>
            </div>
            <button
              onClick={handleQuestionVerify}
              disabled={isPending || !answer}
              className="w-full py-5 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Override Protocol <CheckCircle2 className="w-5 h-5" /></>}
            </button>
            <button onClick={() => setStep("CHOOSE")} className="w-full font-mono text-[10px] uppercase text-truth-textGray hover:text-truth-accentRed transition-colors">Abort & Switch Protocol</button>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="text-center space-y-8">
            <CheckCircle2 className="w-16 h-16 text-truth-accentGreen mx-auto animate-bounce" />
            <div className="space-y-4">
              <h3 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight">Email Transmitted</h3>
              <p className="font-mono text-sm text-truth-textGray uppercase tracking-widest leading-relaxed">
                Decryption key has been sent to your primary archival hub.
              </p>
            </div>
            <Link href="/login" className="inline-block font-mono text-[10px] uppercase tracking-widest text-truth-accentRed hover:underline font-black">
              Return to Login Protocol
            </Link>
          </div>
        )}

        <div className="mt-12 text-center pt-8 border-t border-truth-midGray">
          <Link href="/login" className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-accentRed transition-colors italic">
            Recall Security Key? Return
          </Link>
        </div>
      </div>
    </main>
  )
}
