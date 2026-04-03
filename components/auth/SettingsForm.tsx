"use client"

import { useState } from "react"
import { updateSettings, deleteAccount, checkShadowNameAvailability, type ActionState } from "@/lib/actions/user"
import { useSession } from "next-auth/react"
import { Loader2, Mail, Lock, Shield, Trash2, CheckCircle2, AlertCircle, Globe, MessageSquareCode, Filter, Ban, Timer, ToggleLeft, Fingerprint, RefreshCw } from "lucide-react"
import { ToneType } from "@prisma/client"
import { generateShadowName, isProfane } from "@/lib/utils/shadow"
import TwoFactorSetup from "./TwoFactorSetup"
import Link from "next/link"

interface ShadowUser {
  username?: string
  email?: string
  isTwoFactorEnabled?: boolean
  bio?: string
  image?: string
  securityQuestion?: string
  inboxEnabled?: boolean
  allowAnonymousMsg?: boolean
  questionsOnlyMode?: boolean
  allowedTones?: string[]
  blockedPhrases?: string[]
  messageCooldown?: number
  shadowName?: string
  shadowBio?: string
}

export default function SettingsForm() {
  const { data: session, update } = useSession()
  const user = session?.user as ShadowUser | undefined

  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<ActionState>({})
  
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    bio: user?.bio || "", 
    image: user?.image || "",
    securityQuestion: user?.securityQuestion || "",
    securityAnswer: "",
    inboxEnabled: user?.inboxEnabled ?? true,
    allowAnonymousMsg: user?.allowAnonymousMsg ?? true,
    questionsOnlyMode: user?.questionsOnlyMode ?? false,
    allowedTones: (user?.allowedTones as ToneType[]) || [],
    blockedPhrases: (user?.blockedPhrases as string[])?.join(", ") || "",
    messageCooldown: user?.messageCooldown || 0,
    shadowName: user?.shadowName || "",
    shadowBio: user?.shadowBio || "",
  })

  const [shadowAvailability, setShadowAvailability] = useState<{ checked: boolean, available: boolean, loading: boolean }>({
    checked: false,
    available: true,
    loading: false
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

      <div className="p-8 bg-truth-surface border-2 border-truth-surface-border shadow-[10px_10px_0px_rgba(255,51,102,0.1)]">
        <h3 className="font-bitter text-2xl font-black text-truth-on-surface uppercase mb-6 flex items-center gap-3">
          Profile Configuration
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Username</label>
              <div className="relative">
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 pl-4 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 pl-12 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                />
              </div>
            </div>
          </div>

          {!session?.user?.isAnonymous && (
            <div className="pt-6 border-t border-truth-surface-border space-y-6">
              <h4 className="font-mono text-xs font-bold text-truth-on-surface-muted uppercase mb-4">Profile Metadata</h4>
              
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Bio / Designation</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  placeholder="Transmit your purpose..."
                  className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Display Image URL</label>
                <div className="relative">
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-on-surface-muted" />
                   <input
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://reality.app/your-image.jpg"
                    className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 pl-12 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                  />
                </div>
              </div>

              {/* NEW: Shadow Identity Protocol */}
              <div className="pt-8 border-t border-truth-surface-border space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-truth-accentPurple/20 flex items-center justify-center">
                    <Fingerprint className="w-4 h-4 text-truth-accentPurple" />
                  </div>
                  <h4 className="font-bitter text-xl font-black text-truth-on-surface uppercase tracking-tight">Shadow Identity Protocol</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Shadow Designation</label>
                      <div className="relative">
                        <input
                          value={formData.shadowName}
                          onChange={async (e) => {
                            const val = e.target.value
                            setFormData({...formData, shadowName: val})
                            if (val.length >= 3) {
                              setShadowAvailability(prev => ({ ...prev, loading: true }))
                              const res = await checkShadowNameAvailability(val)
                              setShadowAvailability({
                                checked: true,
                                available: !!res.available,
                                loading: false
                              })
                            } else {
                              setShadowAvailability({ checked: false, available: false, loading: false })
                            }
                          }}
                          className={`w-full bg-truth-surface-input border-2 p-4 text-truth-on-surface font-mono focus:border-truth-accentPurple outline-none ${shadowAvailability.checked ? (shadowAvailability.available ? 'border-truth-accentGreen' : 'border-truth-accentRed') : 'border-truth-surface-border'}`}
                          placeholder="Assign anonymous ID..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newName = generateShadowName()
                        setFormData({...formData, shadowName: newName})
                        setShadowAvailability({ checked: true, available: true, loading: false })
                      }}
                      className="p-4 bg-truth-surface-input border-2 border-truth-surface-border text-truth-on-surface-muted hover:text-truth-accentPurple hover:border-truth-accentPurple transition-all"
                      title="Auto-Generate Shadow Designation"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  {shadowAvailability.checked && !shadowAvailability.loading && (
                    <p className={`font-mono text-[8px] uppercase ${shadowAvailability.available ? 'text-truth-accentGreen' : 'text-truth-accentRed'}`}>
                      {shadowAvailability.available ? 'Identity Unique / Safe to Index' : 'Identity Conflict / Index Failed'}
                    </p>
                  )}
                  {formData.shadowName && isProfane(formData.shadowName) && (
                    <p className="font-mono text-[8px] uppercase text-truth-accentRed italic">Identity Protocol Breach: Restricted Phrases Detected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Anonymous Designation / Bio</label>
                  <textarea
                    value={formData.shadowBio}
                    onChange={(e) => setFormData({...formData, shadowBio: e.target.value})}
                    rows={2}
                    placeholder="Describe your shadow presence..."
                    className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono focus:border-truth-accentPurple outline-none resize-none"
                  />
                  <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase">This will only be displayed when manifesting in Shadow Mode.</p>
                </div>
              </div>

              {/* NEW: Privacy & Safety Section */}
              <div className="pt-8 border-t border-truth-surface-border space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-truth-accentRed/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-truth-accentRed" />
                  </div>
                  <h4 className="font-bitter text-xl font-black text-truth-on-surface uppercase tracking-tight">Privacy & Safety Configuration</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.inboxEnabled ? 'border-truth-accentGreen bg-truth-accentGreen/5' : 'border-truth-surface-border bg-truth-surface-nested'}`}
                       onClick={() => setFormData({...formData, inboxEnabled: !formData.inboxEnabled})}>
                    <div className="flex items-center gap-3">
                      <ToggleLeft className={`w-5 h-5 transition-transform ${formData.inboxEnabled ? 'text-truth-accentGreen' : 'text-truth-on-surface-muted scale-x-[-1]'}`} />
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase text-truth-on-surface">Inbox Status</p>
                        <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase">{formData.inboxEnabled ? 'Online / Receiving' : 'Offline / Restricted'}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 border-2 transition-all cursor-pointer flex items-center justify-between group ${formData.questionsOnlyMode ? 'border-truth-accentBlue bg-truth-accentBlue/5' : 'border-truth-surface-border bg-truth-surface-nested'}`}
                       onClick={() => setFormData({...formData, questionsOnlyMode: !formData.questionsOnlyMode})}>
                    <div className="flex items-center gap-3">
                      <MessageSquareCode className={`w-5 h-5 ${formData.questionsOnlyMode ? 'text-truth-accentBlue' : 'text-truth-on-surface-muted'}`} />
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase text-truth-on-surface">Questions Only</p>
                        <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase">{formData.questionsOnlyMode ? 'Enabled' : 'All Types Allowed'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3 text-truth-on-surface-muted" />
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Signal Tone Filtering (Allowed Transmissions)</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ToneType).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => toggleTone(tone)}
                        className={`px-3 py-2 border font-mono text-[9px] uppercase transition-all duration-200
                          ${formData.allowedTones.includes(tone)
                            ? "bg-truth-on-surface text-truth-surface border-truth-on-surface font-black"
                            : "border-truth-surface-border text-truth-on-surface-muted hover:border-truth-on-surface hover:text-truth-on-surface"}`}
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
                      <Ban className="w-3 h-3 text-truth-on-surface-muted" />
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Blocked Signal Patterns</label>
                    </div>
                    <textarea
                      value={formData.blockedPhrases}
                      onChange={(e) => setFormData({...formData, blockedPhrases: e.target.value})}
                      placeholder="Enter phrases separated by commas..."
                      className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono text-[10px] focus:border-truth-accentRed outline-none resize-none h-24"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3 text-truth-on-surface-muted" />
                      <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Transmission Cooldown (Minutes)</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={formData.messageCooldown}
                        onChange={(e) => setFormData({...formData, messageCooldown: parseInt(e.target.value) || 0})}
                        className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-truth-on-surface-muted uppercase">MIN</div>
                    </div>
                    <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase leading-relaxed">Required interval between successive signals from a single source fingerprint.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-truth-surface-border">
                <h4 className="font-mono text-xs font-bold text-truth-on-surface-muted uppercase mb-4">Account Recovery Protocol</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Security Question</label>
                    <select
                      value={formData.securityQuestion}
                      onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
                      className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                    >
                      <option value="">Select Protocol</option>
                      <option value="maiden_name">Originator&apos;s Maiden Name</option>
                      <option value="first_pet">Initial Companion Name</option>
                      <option value="first_school">Primary Learning Archive</option>
                      <option value="city_born">Coordinate of Origin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Encrypted Answer</label>
                    <input
                      type="password"
                      value={formData.securityAnswer}
                      onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                      placeholder="Assign recovery key"
                      className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-truth-surface-border">
                <h4 className="font-mono text-xs font-bold text-truth-on-surface-muted uppercase mb-4">Security Protocol Update</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">Current Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Confirm current key"
                        className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 pl-12 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted">New Key</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-textGray" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        placeholder="Assign new key"
                        className="w-full bg-truth-surface-input border-2 border-truth-surface-border p-4 pl-12 text-truth-on-surface font-mono focus:border-truth-accentRed outline-none"
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

      <div className="p-8 bg-truth-accentRed/10 border-2 border-truth-accentRed/40">
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
