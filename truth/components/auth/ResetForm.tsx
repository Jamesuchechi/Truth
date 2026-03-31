"use client"

import { useActionState } from "react"
import { resetPassword, type ActionState } from "@/lib/actions/user"
import Link from "next/link"
import { ArrowRight, Loader2, Mail } from "lucide-react"

const initialState: ActionState = {}

export default function ResetForm() {
  const [state, action, isPending] = useActionState(resetPassword, initialState)

  return (
    <div className="w-full max-w-md p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
      <div className="mb-10 text-center">
        <h2 className="font-bitter text-4xl font-black text-truth-textLight uppercase tracking-tight mb-2">Reset Portal</h2>
        <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em]">Recover your identity</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-sm">
          {typeof state.error === 'string' ? state.error : "Validation failed"}
        </div>
      )}

      {state?.success && (
        <div className="mb-6 p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-sm">
          {state.success}
        </div>
      )}

      <form action={action} className="space-y-6">
        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">Registered Email</label>
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
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-6 bg-truth-accentRed text-truth-bg font-mono font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Send Reset Protocol
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/login" className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-accentRed transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  )
}
