"use client"

import { useState } from "react"
import { getTwoFactorSecret, enableTwoFactor, disableTwoFactor, type ActionState } from "@/lib/actions/user"
import { useSession } from "next-auth/react"
import { Loader2, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, QrCode } from "lucide-react"

export default function TwoFactorSetup() {
  const { data: session, update } = useSession()
  const [isPending, setIsPending] = useState(false)
  const [step, setStep] = useState<'idle' | 'setup' | 'enabled'> (
    session?.user?.isTwoFactorEnabled ? 'enabled' : 'idle'
  )
  const [secretData, setSecretData] = useState<{ secret: string, qrCode: string } | null>(null)
  const [code, setCode] = useState("")
  const [state, setState] = useState<ActionState>({})

  const isTwoFactorEnabled = !!session?.user?.isTwoFactorEnabled

  const handleStartSetup = async () => {
    setIsPending(true)
    const result = await getTwoFactorSecret()
    if ('error' in result) {
      setState({ error: result.error })
    } else {
      setSecretData(result as { secret: string, qrCode: string })
      setStep('setup')
    }
    setIsPending(false)
  }

  const handleEnable = async () => {
    if (!secretData) return
    setIsPending(true)
    const result = await enableTwoFactor(secretData.secret, code)
    if (result.success) {
      setStep('enabled')
      setState({ success: result.success })
      await update() // Refresh session
    } else {
      setState({ error: result.error })
    }
    setIsPending(false)
  }

  const handleDisable = async () => {
    if (!confirm("Are you sure? This lowers your account security.")) return
    setIsPending(true)
    const result = await disableTwoFactor()
    if (result.success) {
      setStep('idle')
      setState({ success: result.success })
      await update()
    }
    setIsPending(false)
  }

  return (
    <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.1)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bitter text-2xl font-black text-truth-textLight uppercase flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-truth-accentGreen" /> Multi-Factor Protocol
        </h3>
        {isTwoFactorEnabled ? (
          <span className="px-3 py-1 bg-truth-accentGreen/10 text-truth-accentGreen border border-truth-accentGreen font-mono text-[10px] uppercase">Active</span>
        ) : (
          <span className="px-3 py-1 bg-truth-accentRed/10 text-truth-accentRed border border-truth-accentRed font-mono text-[10px] uppercase">Inactive</span>
        )}
      </div>

      {!isTwoFactorEnabled && step === 'idle' && (
        <div className="space-y-4">
          <p className="font-mono text-xs text-truth-textGray uppercase tracking-wider">Add an extra layer of security using TOTP (Google Authenticator, Authy, etc.)</p>
          <button
            onClick={handleStartSetup}
            disabled={isPending}
            className="px-6 py-3 bg-truth-accentGreen text-truth-bg font-mono font-bold uppercase text-xs hover:bg-white transition-colors flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initialize 2FA Procedure <QrCode className="w-4 h-4" /></>}
          </button>
        </div>
      )}

      {step === 'setup' && secretData && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-truth-bg p-6 border border-truth-midGray">
            <div className="bg-white p-2">
              <img src={secretData.qrCode} alt="QR Code" className="w-32 h-32" />
            </div>
            <div className="space-y-4 flex-1">
              <p className="font-mono text-xs text-truth-textLight uppercase tracking-tight">1. Scan this holographic key with your authenticator device</p>
              <div className="p-3 bg-truth-nearBlack border border-truth-midGray font-mono text-[10px] text-truth-textGray break-all">
                Manual Entry: <span className="text-truth-accentGreen select-all">{secretData.secret}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">2. Enter the generated verification code</label>
            <div className="flex gap-4">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="flex-1 bg-truth-bg border-2 border-truth-midGray p-4 text-truth-textLight font-mono text-center tracking-[0.5em] focus:border-truth-accentGreen outline-none"
              />
              <button
                onClick={handleEnable}
                disabled={isPending || code.length < 6}
                className="px-8 py-4 bg-truth-accentGreen text-truth-bg font-mono font-bold uppercase text-xs hover:bg-white disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
              </button>
            </div>
          </div>
          <button onClick={() => setStep('idle')} className="text-truth-textGray font-mono text-[10px] uppercase hover:text-truth-accentRed transition-colors">Cancel Procedure</button>
        </div>
      )}

      {isTwoFactorEnabled && (
        <div className="space-y-4">
          <p className="font-mono text-xs text-truth-textGray uppercase tracking-wider">Your account is fortified with cryptographic multi-factor authentication.</p>
          <button
            onClick={handleDisable}
            disabled={isPending}
            className="px-6 py-3 border border-truth-accentRed text-truth-accentRed font-mono font-bold uppercase text-[10px] hover:bg-truth-accentRed hover:text-truth-bg transition-all flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Deactivate 2FA Shield <ShieldAlert className="w-4 h-4" /></>}
          </button>
        </div>
      )}

      {state.error && (
        <div className="mt-6 p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {typeof state.error === 'string' ? state.error : "Verification failed"}
        </div>
      )}

      {state.success && (
        <div className="mt-6 p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {state.success}
        </div>
      )}
    </div>
  )
}
