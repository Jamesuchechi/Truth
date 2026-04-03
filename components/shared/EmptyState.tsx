"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Terminal, RefreshCw } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({
  icon: Icon = Terminal,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border bg-muted/5 min-h-[400px] rounded-sm group"
    >
      <div className="relative mb-6">
        <motion.div 
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-truth-accentRed/10 blur-xl rounded-full scale-150"
        />
        <div className="relative w-16 h-16 bg-muted/10 border-2 border-border flex items-center justify-center group-hover:border-truth-accentRed transition-colors">
          <Icon className="w-8 h-8 text-muted group-hover:text-truth-accentRed transition-colors" />
        </div>
      </div>

      <h3 className="font-bitter font-black text-lg uppercase tracking-tight text-foreground mb-2">
        {title}
      </h3>
      <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] max-w-sm mx-auto leading-loose mb-8">
        {description}
      </p>

      {action && (
        <div className="flex flex-col items-center gap-4">
          {action.href ? (
            <Link 
              href={action.href}
              className="px-8 py-3 bg-truth-accentRed text-black font-mono text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-truth-accentRed/90 transition-all shadow-[6px_6px_0px_rgba(255,51,102,0.2)] active:scale-95"
            >
              {action.label}
            </Link>
          ) : (
            <button 
              onClick={action.onClick}
              className="px-8 py-3 bg-truth-accentRed text-black font-mono text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-truth-accentRed/90 transition-all shadow-[6px_6px_0px_rgba(255,51,102,0.2)] active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              {action.label}
            </button>
          )}
        </div>
      )}

      {/* Protocol Metadata Decoration */}
      <div className="mt-12 flex items-center gap-6 opacity-20 select-none pointer-events-none">
        <div className="flex flex-col items-start gap-1">
          <div className="h-px w-24 bg-border" />
          <span className="font-mono text-[6px] uppercase">Node_Status: VACANT</span>
        </div>
        <Terminal className="w-4 h-4" />
        <div className="flex flex-col items-end gap-1">
          <div className="h-px w-24 bg-border" />
          <span className="font-mono text-[6px] uppercase">Search_Radius: GLOBAL</span>
        </div>
      </div>
    </motion.div>
  )
}
