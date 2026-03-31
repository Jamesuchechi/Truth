"use client"

import { useActionState, useState } from "react"
import { newPassword, type ActionState } from "@/lib/actions/user"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Loader2, Lock, Eye, EyeOff } from "lucide-react"

const initialState: ActionState = {}

export default function NewPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)
  
  const actionWithToken = async (prevState: ActionState, formData: FormData) => {
    const password = formData.get("password") as string
    return newPassword(password, token)
  }

  const [state, action, isPending] = useActionState(actionWithToken, initialState)

  return (
    <div className="w-full max-w-md p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
      <div className="mb-10 text-center">
        <h2 className="font-bitter text-4xl font-black text-truth-textLight uppercase tracking-tight mb-2">Protocol Reset</h2>
        <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em]">Enter new security key</p>
      </div>

      {state?.error && (
        <div className="mb-6 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-sm">
          {typeof state.error === 'string' ? state.error : "Update failed"}
        </div>
      )}

      {state?.success && (
        <div className="mb-6 p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-sm">
          {state.success}
          <Link href="/login" className="block mt-2 underline font-bold">Log in now</Link>
        </div>
      )}

      {!state?.success && (
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray ml-1">New Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray group-focus-within:text-truth-accentRed transition-colors" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 pr-12 text-truth-textLight font-mono focus:outline-none focus:border-truth-accentRed transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-truth-textGray hover:text-truth-textLight"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-6 bg-truth-accentRed text-truth-bg font-mono font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Update Security Protocol
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-8 text-center">
        <Link href="/login" className="font-mono text-[10px] uppercase tracking-widest text-truth-textGray hover:text-truth-accentRed transition-colors">
          Return to Portal
        </Link>
      </div>
    </div>
  )
}
