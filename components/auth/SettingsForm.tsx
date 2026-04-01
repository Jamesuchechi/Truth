"use client"

import { useState } from "react"
import { updateSettings, deleteAccount, type ActionState } from "@/lib/actions/user"
import { useSession } from "next-auth/react"
import { Loader2, Mail, Lock, Shield, Trash2, CheckCircle2, AlertCircle, Globe } from "lucide-react"
import TwoFactorSetup from "./TwoFactorSetup"
import Link from "next/link"

export default function SettingsForm() {
  const { data: session, update } = useSession()
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<ActionState>({})
  
  const [formData, setFormData] = useState({
    username: session?.user?.username || "",
    email: session?.user?.email || "",
    password: "",
    newPassword: "",
    isTwoFactorEnabled: session?.user?.isTwoFactorEnabled || false,
    bio: "", 
    image: "",
    securityQuestion: "",
    securityAnswer: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setState({})

    try {
      const result = await updateSettings(formData)
      setState(result)
      if (result.success) {
        await update() // Refresh session
      }
    } catch {
      setState({ error: "Something went wrong" })
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return
    setIsPending(true)
    await deleteAccount()
  }

  return (
    <div className="w-full max-w-2xl space-y-8 animate-fadeIn">
      {session?.user?.isAnonymous && (
        <div className="p-8 bg-truth-accentRed border-2 border-truth-accentRed shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
          <div className="flex items-start gap-4">
            <Shield className="w-10 h-10 text-truth-bg shrink-0 mt-1" />
            <div>
              <h3 className="font-bitter text-2xl font-black text-truth-bg uppercase mb-2">Temporary Identity</h3>
              <p className="font-mono text-sm text-truth-bg/80 mb-6 uppercase tracking-wide leading-relaxed">
                You are currently operating in Shadow Mode. Your data is restricted to this session and may be lost.
              </p>
              <Link 
                href="/signup" 
                className="inline-block px-6 py-3 bg-truth-bg text-truth-accentRed font-mono font-bold uppercase text-xs hover:bg-white transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none"
              >
                Secure Your Account Protocol
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.1)]">
        <h3 className="font-bitter text-2xl font-black text-truth-textLight uppercase mb-6 flex items-center gap-3">
          Profile Configuration
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Username</label>
              <div className="relative">
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-4 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                />
              </div>
            </div>
          </div>

          {!session?.user?.isAnonymous && (
            <div className="pt-6 border-t border-truth-midGray space-y-6">
              <h4 className="font-mono text-xs font-bold text-truth-textGray uppercase mb-4">Profile Metadata</h4>
              
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Bio / Designation</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  placeholder="Transmit your purpose..."
                  className="w-full bg-truth-bg border-2 border-truth-midGray p-4 text-truth-textLight font-mono focus:border-truth-accentRed outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Display Image URL</label>
                <div className="relative">
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                   <input
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://reality.app/your-image.jpg"
                    className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-truth-midGray">
                <h4 className="font-mono text-xs font-bold text-truth-textGray uppercase mb-4">Account Recovery Protocol</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Security Question</label>
                    <select
                      value={formData.securityQuestion}
                      onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
                      className="w-full bg-truth-nearBlack border-2 border-truth-midGray p-4 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                    >
                      <option value="">Select Protocol</option>
                      <option value="maiden_name">Originator&apos;s Maiden Name</option>
                      <option value="first_pet">Initial Companion Name</option>
                      <option value="first_school">Primary Learning Archive</option>
                      <option value="city_born">Coordinate of Origin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Encrypted Answer</label>
                    <input
                      type="password"
                      value={formData.securityAnswer}
                      onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                      placeholder="Assign recovery key"
                      className="w-full bg-truth-bg border-2 border-truth-midGray p-4 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-truth-midGray">
                <h4 className="font-mono text-xs font-bold text-truth-textGray uppercase mb-4">Security Protocol Update</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Current Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Confirm current key"
                        className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">New Key</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        placeholder="Assign new key"
                        className="w-full bg-truth-bg border-2 border-truth-midGray p-4 pl-12 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.error && (
            <div className="p-4 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {typeof state.error === 'string' ? state.error : "Update failed"}
            </div>
          )}

          {state.success && (
            <div className="p-4 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {state.success}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-truth-textLight text-truth-bg font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Profile Changes"}
          </button>
        </form>
      </div>

      <TwoFactorSetup />

      <div className="p-8 bg-truth-accentRed/5 border-2 border-truth-accentRed/20">
        <h3 className="font-bitter text-2xl font-black text-truth-accentRed uppercase mb-2 flex items-center gap-3">
          <Trash2 className="w-6 h-6" /> Danger Zone
        </h3>
        <p className="font-mono text-xs text-truth-textGray mb-6 uppercase tracking-wider">Permanent identity deletion from the network</p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-6 py-3 border-2 border-truth-accentRed text-truth-accentRed font-mono font-bold uppercase text-xs hover:bg-truth-accentRed hover:text-truth-bg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          Terminate Account Protocol
        </button>
      </div>
    </div>
  )
}
