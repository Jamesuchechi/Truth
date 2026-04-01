"use client"

import { useActionState, useTransition, useEffect } from "react"
import { loginUser, loginAnonymous, type ActionState } from "@/lib/actions/user"
import Link from "next/link"
import { ArrowRight, Loader2, Mail, Lock, ShieldCheck, Ghost } from "lucide-react"
import { useRouter } from "next/navigation"
import SocialLogins from "./SocialLogins"

const initialState: ActionState = {}

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginUser, initialState)
  const [isAnonChange, startAnonTransition] = useTransition()
  const router = useRouter()

  const handleAnonymous = () => {
    startAnonTransition(async () => {
      const res = await loginAnonymous()
      if (res.success) {
        router.push("/feed")
        router.refresh()
      }
    })
  }

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/feed")
        router.refresh()
      }, 1000) // Small delay to let success message breathe
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  const isAnyPending = isPending || isAnonChange

  const getError = (field: string) => {
    if (typeof state?.error === 'object' && state.error !== null) {
      return (state.error as Record<string, string[] | undefined>)[field]?.[0]
    }
    return null
  }

  const generalError = typeof state?.error === 'string' ? state.error : null

  return (
    <div className="w-full max-w-md p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.2)] animate-[fadeInScale_1.5s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="mb-10 text-center">
        <h2 className="font-bitter text-4xl font-black text-truth-textLight uppercase tracking-tight mb-2">
          {state?.twoFactor ? "Security Check" : "Access Portal"}
        </h2>
        <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em]">
          {state?.twoFactor ? "Finalize Authentication" : "Return to the reality"}
        </p>
      </div>

      {generalError && (
        <div className="mb-6 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-sm">
          {generalError}
        </div>
      )}

      {state?.success && (
        <div className="mb-6 p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-sm">
          {state.success}
        </div>
      )}

      <form action={action} className="space-y-6">
        {!state?.twoFactor && (
          <>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
                  placeholder="you@truth.app"
                />
              </div>
              {getError('email') && (
                 <p className="text-[10px] text-truth-accentRed font-mono mt-1">{getError('email')}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
                  placeholder="••••••••"
                />
              </div>
              {getError('password') && (
                 <p className="text-[10px] text-truth-accentRed font-mono mt-1">{getError('password')}</p>
              )}
            </div>
          </>
        )}

        {state?.twoFactor && (
          <div className="space-y-2 animate-in fade-in duration-500">
            <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">MFA Access Code</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-accentGreen group-focus-within:text-truth-accentRed transition-colors" />
              <input
                name="code"
                type="text"
                required
                className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all tracking-[0.5em] text-center"
                placeholder="000 000"
              />
            </div>
            <p className="text-[10px] text-truth-textGray font-mono mt-1">Enter the dynamic key from your device</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isAnyPending}
          className="w-full py-6 bg-truth-accentRed text-truth-bg font-mono font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:scale-100"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Authorize Access
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          disabled={isAnyPending}
          onClick={handleAnonymous}
          className="w-full py-4 border-2 border-truth-midGray text-truth-textGray font-mono text-[10px] uppercase tracking-widest hover:border-truth-accentRed hover:text-truth-accentRed transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isAnonChange ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Ghost className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Shadow Entry (Guest Session)
            </>
          )}
        </button>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-truth-midGray"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-truth-textGray bg-truth-nearBlack px-2">
          Or Protocol Sync
        </div>
      </div>

      <SocialLogins />

      <div className="mt-8 text-center flex flex-col gap-4">
        <Link href="/auth/forgot-password" title="Initiate Security Override" className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-accentRed transition-colors italic">
          Forgot Security Key?
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray border-t border-truth-midGray pt-4">
          New to the network?
          <Link href="/signup" className="ml-2 text-truth-accentRed hover:underline font-bold">Register Initial</Link>
        </p>
      </div>
    </div>
  )
}
