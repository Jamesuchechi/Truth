// components/profile/ShadowManagement.tsx
"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Ghost, Trash2, Save, Loader2, AlertTriangle } from "lucide-react"
import { updateSettings, deleteShadowIdentity } from "@/lib/actions/user"
import { useRouter } from "next/navigation"

interface ShadowManagementProps {
  user: {
    shadowName?: string | null
    shadowBio?: string | null
    defaultShadowMode?: boolean
    showShadowOnProfile?: boolean
  }
}

export default function ShadowManagement({ user }: ShadowManagementProps) {
  const [shadowName, setShadowName] = useState(user.shadowName || "")
  const [shadowBio, setShadowBio] = useState(user.shadowBio || "")
  const [defaultShadowMode, setDefaultShadowMode] = useState<boolean>(user.defaultShadowMode ?? false)
  const [showShadowOnProfile, setShowShadowOnProfile] = useState<boolean>(user.showShadowOnProfile ?? true)
  
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleUpdate = async () => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateSettings({
        shadowName,
        shadowBio,
        defaultShadowMode,
        showShadowOnProfile
      })

      if (result.error) {
        setMessage({ type: 'error', text: typeof result.error === 'string' ? result.error : "Failed to update protocol." })
      } else {
        setMessage({ type: 'success', text: "Protocol synchronized." })
        router.refresh()
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete your shadow persona and all reputation associated with it.")) return
    
    startTransition(async () => {
      const result = await deleteShadowIdentity()
      if (result.error) {
        setMessage({ type: 'error', text: typeof result.error === 'string' ? result.error : "Failed to terminate identity." })
      } else {
        setMessage({ type: 'success', text: "Identity terminated." })
        setShadowName("")
        setShadowBio("")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-truth-surface-border pb-4">
        <Ghost className="w-8 h-8 text-truth-accentRed" />
        <div>
          <h2 className="font-bitter text-2xl font-black text-truth-on-surface uppercase">Shadow Identity Management</h2>
          <p className="font-mono text-[10px] text-truth-on-surface-muted uppercase tracking-widest">Persona Protocol // ID_ENCRYPTION_ACTIVE</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identity Settings */}
        <div className="space-y-6 bg-truth-surface p-8 border-2 border-truth-surface-border shadow-[10px_10px_0px_rgba(0,0,0,0.15)]">
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase text-truth-on-surface-muted font-bold">Shadow Identifier</label>
            <input 
              type="text"
              value={shadowName}
              onChange={(e) => setShadowName(e.target.value)}
              placeholder="Designation required..."
              className="w-full bg-truth-surface-input border border-truth-surface-border px-4 py-3 font-mono text-sm text-truth-on-surface focus:border-truth-accentRed outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase text-truth-on-surface-muted font-bold">Shadow Manifest (Bio)</label>
            <textarea 
              value={shadowBio}
              onChange={(e) => setShadowBio(e.target.value)}
              placeholder="Describe the unseen..."
              rows={4}
              className="w-full bg-truth-surface-input border border-truth-surface-border px-4 py-3 font-mono text-sm text-truth-on-surface focus:border-truth-accentRed outline-none transition-all resize-none italic"
            />
          </div>
        </div>

        {/* Behavior & Privacy */}
        <div className="space-y-6">
          <div className="p-6 bg-truth-surface border-2 border-truth-surface-border space-y-6">
            <h3 className="font-mono text-xs font-bold text-truth-accentBlue uppercase tracking-widest">Protocol Rules</h3>
            
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setDefaultShadowMode(!defaultShadowMode)}>
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase text-truth-on-surface group-hover:text-truth-accentRed transition-colors">Default Shadow Mode</span>
                <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase">All new posts will use shadow identity</p>
              </div>
              <div className={`w-12 h-6 flex items-center ${defaultShadowMode ? 'bg-truth-accentRed' : 'bg-truth-surface-nested'} p-1 transition-colors duration-300`}>
                <motion.div 
                  className="w-4 h-4 bg-truth-bg"
                  animate={{ x: defaultShadowMode ? 24 : 0 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowShadowOnProfile(!showShadowOnProfile)}>
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase text-truth-on-surface group-hover:text-truth-accentRed transition-colors">Display Shadow on Profile</span>
                <p className="font-mono text-[8px] text-truth-on-surface-muted uppercase">Link your shadow name to your real profile</p>
              </div>
              <div className={`w-12 h-6 flex items-center ${showShadowOnProfile ? 'bg-truth-accentBlue' : 'bg-truth-surface-nested'} p-1 transition-colors duration-300`}>
                <motion.div 
                  className="w-4 h-4 bg-truth-bg"
                  animate={{ x: showShadowOnProfile ? 24 : 0 }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-truth-accentRed/5 border-2 border-truth-accentRed/40 space-y-4">
             <div className="flex items-center gap-2 text-truth-accentRed">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-mono text-xs font-black uppercase">Destructive Action</h3>
             </div>
             <p className="font-mono text-[9px] text-truth-on-surface-muted uppercase leading-relaxed">
                Termination of shadow identity is irreversible. All accumulated reputation and history will be purged from the central node.
             </p>
             <button 
                onClick={handleDelete}
                disabled={isPending}
                className="w-full py-3 bg-transparent border-2 border-truth-accentRed text-truth-accentRed font-mono text-[10px] uppercase font-black hover:bg-truth-accentRed hover:text-truth-bg transition-all flex items-center justify-center gap-2"
             >
                <Trash2 className="w-3 h-3" /> Terminate_Identity
             </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-truth-surface-border">
        <div className="flex items-center gap-3">
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-mono text-[10px] uppercase tracking-widest ${message.type === 'success' ? 'text-truth-accentGreen' : 'text-truth-accentRed'}`}
            >
              [{message.type === 'success' ? 'SYNC_COMPLETE' : 'PROTOCOL_ERROR'}]: {message.text}
            </motion.div>
          )}
        </div>
        
        <button 
          onClick={handleUpdate}
          disabled={isPending}
          className="px-12 py-4 bg-truth-textLight text-truth-bg font-mono text-sm font-black uppercase flex items-center gap-3 hover:bg-truth-accentRed hover:text-truth-bg transition-all shadow-[10px_10px_0px_rgba(255,255,255,0.1)] group"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          Synchronize_Changes
        </button>
      </div>
    </div>
  )
}
