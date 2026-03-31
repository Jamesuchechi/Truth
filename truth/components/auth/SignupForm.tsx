// components/auth/SignupForm.tsx
"use client"

import { useState, useEffect, useActionState } from "react"
import { registerUser, type ActionState } from "@/lib/actions/user"
import Link from "next/link"
import { ArrowRight, Loader2, Mail, User, Lock, CheckCircle2, XCircle } from "lucide-react"

const initialState: ActionState = {}

export default function SignupForm() {
  const [state, action, isPending] = useActionState(registerUser, initialState)
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'reserved'>('idle')

  useEffect(() => {
    if (username.length < 3) return

    const timer = setTimeout(async () => {
      setUsernameStatus('checking')
      try {
        const res = await fetch(`/api/user/check-username?username=${username}`)
        const data = await res.json()
        if (data.reserved) setUsernameStatus('reserved')
        else if (data.available) setUsernameStatus('available')
        else setUsernameStatus('taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

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
        <h2 className="font-bitter text-4xl font-black text-truth-textLight uppercase tracking-tight mb-2">Create Account</h2>
        <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em]">Join the wall of truth</p>
      </div>

      {state?.success && (
        <div className="mb-6 p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-sm">
          {state.success}
          <Link href="/login" className="block mt-2 underline font-bold">Log in here</Link>
        </div>
      )}

      {generalError && (
        <div className="mb-6 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-sm">
          {generalError}
        </div>
      )}

      <form action={action} className="space-y-6">
        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Username</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
            <input
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                const val = e.target.value
                setUsername(val)
                if (val.length < 3) setUsernameStatus('idle')
              }}
              className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
              placeholder="anonymous_soul"
            />
            {usernameStatus === 'checking' && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray animate-spin" />
            )}
            {usernameStatus === 'available' && (
              <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-accentGreen" />
            )}
            {(usernameStatus === 'taken' || usernameStatus === 'reserved') && (
              <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-accentRed" />
            )}
          </div>
          {usernameStatus === 'taken' && (
            <p className="text-[10px] text-truth-accentRed font-mono mt-1">Username is already claimed</p>
          )}
          {usernameStatus === 'reserved' && (
            <p className="text-[10px] text-truth-accentRed font-mono mt-1">Username is reserved by system</p>
          )}
          {getError('username') && (
             <p className="text-[10px] text-truth-accentRed font-mono mt-1">{getError('username')}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Email</label>
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
          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Password</label>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-6 bg-truth-accentRed text-truth-bg font-mono font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:scale-100"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Initialize Protocol
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray">
          Already part of the network?
          <Link href="/login" className="ml-2 text-truth-accentRed hover:underline font-bold">Log in</Link>
        </p>
      </div>
    </div>
  )
}
