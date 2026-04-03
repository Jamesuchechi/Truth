"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Home, Bell, User, Settings, Hash, MessageSquare, Terminal, X } from "lucide-react"
import Logo from "./Logo"

const ACTIONS = [
  { id: "feed", icon: Home, label: "Switch to Feed", shortcut: "H", path: "/feed" },
  { id: "notifications", icon: Bell, label: "View Signals", shortcut: "N", path: "/notifications" },
  { id: "profile", icon: User, label: "View My Identity", shortcut: "P", path: "/profile" },
  { id: "channels", icon: Hash, label: "Frequency Matrix", shortcut: "CH", path: "/channels" },
  { id: "inbox", icon: MessageSquare, label: "Secure Comms", shortcut: "I", path: "/inbox" },
  { id: "settings", icon: Settings, label: "Protocol Config", shortcut: "S", path: "/settings" },
  { id: "compose", icon: () => <Logo size={16} />, label: "Quick Post", shortcut: "C", action: "compose" },
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredActions = ACTIONS.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => {
        const next = !prev
        if (next) {
          setSelectedIndex(0)
          setQuery("")
        }
        return next
      })
    }
    window.addEventListener("truth-command-palette", handleToggle)
    return () => window.removeEventListener("truth-command-palette", handleToggle)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  const handleAction = useCallback((action: typeof ACTIONS[0]) => {
    setIsOpen(false)
    if (action.path) {
      router.push(action.path)
    } else if (action.action === "compose") {
      window.dispatchEvent(new CustomEvent("truth-compose"))
    }
  }, [router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Escape") setIsOpen(false)
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredActions.length)
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length)
      }
      if (e.key === "Enter") {
        e.preventDefault()
        if (filteredActions[selectedIndex]) {
          handleAction(filteredActions[selectedIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredActions, selectedIndex, handleAction])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-200"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-card border-2 border-truth-accentRed shadow-[0_0_50px_rgba(255,51,102,0.15)] z-201 overflow-hidden rounded-sm"
          >
            {/* Search Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b-2 border-border bg-muted/5">
              <Search className="w-5 h-5 text-truth-accentRed" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Synchronize with node (Go to feed, Profile, Settings...)"
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs uppercase tracking-widest placeholder:text-muted/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] bg-muted/10 px-1.5 py-0.5 rounded-sm border border-border">ESC</span>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4 text-muted hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  {filteredActions.map((action, index) => {
                    const isSelected = index === selectedIndex
                    return (
                      <button
                        key={action.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => handleAction(action)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all
                          ${isSelected ? "bg-truth-accentRed/10 border-l-4 border-truth-accentRed pl-3" : "hover:bg-muted/5"}
                        `}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <action.icon className={`w-4 h-4 ${isSelected ? "text-truth-accentRed" : "text-muted"}`} />
                          <div>
                            <p className={`font-mono text-[10px] uppercase font-black ${isSelected ? "text-truth-accentRed" : "text-foreground"}`}>
                              {action.label}
                            </p>
                            <p className="font-mono text-[7px] text-muted uppercase tracking-tighter">PROTOCOL_NAV_{action.id.toUpperCase()}</p>
                          </div>
                        </div>
                        {action.shortcut && (
                          <span className="font-mono text-[9px] bg-muted/10 px-2 py-0.5 border border-border text-muted">
                            {action.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-50 grayscale">
                  <Terminal className="w-8 h-8 mb-4 animate-pulse text-truth-accentRed" />
                  <p className="font-mono text-[10px] uppercase font-bold text-muted tracking-[0.3em]">No node mapping found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-muted/5 border-t-2 border-border flex items-center justify-between text-[7px] font-mono uppercase text-muted tracking-widest px-6">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><span className="bg-muted/20 px-1 rounded-sm border border-border">↑↓</span> Navigate</span>
                <span className="flex items-center gap-1"><span className="bg-muted/20 px-1 rounded-sm border border-border">↵</span> Select</span>
              </div>
              <p>TruthOS Universal Command Interface v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
