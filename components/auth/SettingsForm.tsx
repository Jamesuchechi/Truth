"use client"

import { useState } from "react"
import { updateSettings, deleteAccount, type ActionState } from "@/lib/actions/user"
import { useSession } from "next-auth/react"
import { Loader2, Mail, Lock, Shield, Trash2, CheckCircle2, AlertCircle, Globe, MessageSquareCode, Filter, Ban, Timer, ToggleLeft } from "lucide-react"
import { ToneType } from "@prisma/client"
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
    bio: session?.user?.bio || "", 
    image: session?.user?.image || "",
    securityQuestion: session?.user?.securityQuestion || "",
    securityAnswer: "",
    inboxEnabled: session?.user?.inboxEnabled ?? true,
    allowAnonymousMsg: session?.user?.allowAnonymousMsg ?? true,
    questionsOnlyMode: session?.user?.questionsOnlyMode ?? false,
    allowedTones: (session?.user?.allowedTones as ToneType[]) || [],
    blockedPhrases: (session?.user?.blockedPhrases as string[])?.join(", ") || "",
    messageCooldown: session?.user?.messageCooldown || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setState({})

    try {
      const dataToSubmit = {
        ...formData,
        blockedPhrases: formData.blockedPhrases.split(",").map(p => p.trim()).filter(p => p !== ""),
        messageCooldown: Number(formData.messageCooldown)
      }
      const result = await updateSettings(dataToSubmit)
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

  const toggleTone = (tone: ToneType) => {
    const current = formData.allowedTones
    if (current.includes(tone)) {
      setFormData({ ...formData, allowedTones: current.filter(t => t !== tone) })
    } else {
      setFormData({ ...formData, allowedTones: [...current, tone] })
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

              {/* NEW: Privacy & Safety Section */}
              <div className="pt-8 border-t border-truth-midGray space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-truth-accentRed/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-truth-accentRed" />
                  </div>
                  <h4 className="font-bitter text-xl font-black text-truth-textLight uppercase tracking-tight">Privacy & Safety Configuration</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.inboxEnabled ? 'border-truth-accentGreen bg-truth-accentGreen/5' : 'border-truth-midGray bg-truth-darkGray/30'}`}
                       onClick={() => setFormData({...formData, inboxEnabled: !formData.inboxEnabled})}>
                    <div className="flex items-center gap-3">
                      <ToggleLeft className={`w-5 h-5 transition-transform ${formData.inboxEnabled ? 'text-truth-accentGreen' : 'text-truth-textGray scale-x-[-1]'}`} />
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase text-truth-textLight">Inbox Status</p>
                        <p className="font-mono text-[8px] text-truth-textGray uppercase">{formData.inboxEnabled ? 'Online / Receiving' : 'Offline / Restricted'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.questionsOnlyMode ? 'border-truth-accentBlue bg-truth-accentBlue/5' : 'border-truth-midGray bg-truth-darkGray/30'}`}
                       onClick={() => setFormData({...formData, questionsOnlyMode: !formData.questionsOnlyMode})}>
                    <div className="flex items-center gap-3">
                      <MessageSquareCode className={`w-5 h-5 ${formData.questionsOnlyMode ? 'text-truth-accentBlue' : 'text-truth-textGray'}`} />
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase text-truth-textLight">Questions Only</p>
                        <p className="font-mono text-[8px] text-truth-textGray uppercase">{formData.questionsOnlyMode ? 'Enabled' : 'All Types Allowed'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3 text-truth-textGray" />
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Signal Tone Filtering (Allowed Transmissions)</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ToneType).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => toggleTone(tone)}
                        className={`px-3 py-2 border font-mono text-[9px] uppercase transition-all duration-200
                          ${formData.allowedTones.includes(tone)
                            ? "bg-truth-textLight text-truth-bg border-truth-textLight font-black"
                            : "border-truth-midGray text-truth-textGray hover:border-truth-textLight hover:text-truth-textLight"}`}
                      >
                        {tone}
                      </button>
                    ))}
                    {formData.allowedTones.length === 0 && (
                       <span className="font-mono text-[8px] text-truth-accentYellow uppercase self-center ml-2 italic underline decoration-dotted">Warning: No filter active (All tones accepted)</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Ban className="w-3 h-3 text-truth-textGray" />
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Blocked Signal Patterns</label>
                    </div>
                    <textarea
                      value={formData.blockedPhrases}
                      onChange={(e) => setFormData({...formData, blockedPhrases: e.target.value})}
                      placeholder="Enter phrases separated by commas..."
                      className="w-full bg-truth-bg border-2 border-truth-midGray p-4 text-truth-textLight font-mono text-[10px] focus:border-truth-accentRed outline-none resize-none h-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3 text-truth-textGray" />
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-textGray">Transmission Cooldown (Minutes)</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={formData.messageCooldown}
                        onChange={(e) => setFormData({...formData, messageCooldown: parseInt(e.target.value) || 0})}
                        className="w-full bg-truth-bg border-2 border-truth-midGray p-4 text-truth-textLight font-mono focus:border-truth-accentRed outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-truth-textGray uppercase">MIN</div>
                    </div>
                    <p className="font-mono text-[8px] text-truth-textGray uppercase leading-relaxed">Required interval between successive signals from a single source fingerprint.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-truth-midGray">
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
