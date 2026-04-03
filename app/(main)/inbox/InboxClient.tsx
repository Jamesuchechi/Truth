"use client"

import { useState, useMemo } from "react"
import { MessageType, ToneType } from "@prisma/client"
import { 
    Inbox as InboxIcon, Filter, Layers, Zap, MessageSquare, 
    HelpCircle, Heart, X, Search, CheckSquare, Square, 
    Trash2, Archive, Eye, Star 
} from "lucide-react"
import { bulkMessageAction } from "@/lib/actions/messageActions"
import ExportDialog from "@/components/inbox/ExportDialog"
import AnalyticsView from "@/components/inbox/AnalyticsView"
import MessageItem from "@/components/inbox/MessageItem"
import { motion, AnimatePresence } from "framer-motion"
import type { Message } from "@/lib/types/message"
import { BarChart2, Download } from "lucide-react"

interface InboxClientProps {
  initialMessages: Message[]
}

export default function InboxClient({ initialMessages }: InboxClientProps) {
  const [activeType, setActiveType] = useState<MessageType | "ALL">("ALL")
  const [activeTone, setActiveTone] = useState<ToneType | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [viewStatus, setViewStatus] = useState<'INBOX' | 'ARCHIVED' | 'FAVORITES'>('INBOX')
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  const filteredMessages = useMemo(() => {
    return initialMessages.filter(msg => {
      const typeMatch = activeType === "ALL" || msg.type === activeType
      const toneMatch = activeTone === "ALL" || msg.tone === activeTone
      const searchMatch = msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      const statusMatch = 
        viewStatus === 'ARCHIVED' ? msg.isArchived :
        viewStatus === 'FAVORITES' ? msg.isFavorite :
        (!msg.isArchived) // Default inbox view
      
      return typeMatch && toneMatch && searchMatch && statusMatch
    })
  }, [initialMessages, activeType, activeTone, searchQuery, viewStatus])

  const typeTabs = [
    { id: "ALL", label: "All_Signals", icon: Layers },
    { id: MessageType.TEXT, label: "Text", icon: MessageSquare },
    { id: MessageType.CONFESSION, label: "Confession", icon: Zap },
    { id: MessageType.QUESTION, label: "Question", icon: HelpCircle },
    { id: MessageType.COMPLIMENT, label: "Compliment", icon: Heart },
  ]

  const statusTabs = [
    { id: 'INBOX', label: 'Inbox', icon: InboxIcon },
    { id: 'ARCHIVED', label: 'Archived', icon: Archive },
    { id: 'FAVORITES', label: 'Favorites', icon: Star },
  ]
  const tones = [
    { id: "ALL", label: "All_Tones", color: "bg-truth-midGray" },
    { id: ToneType.HONEST, label: "Honest", color: "bg-truth-accentGreen" },
    { id: ToneType.HARSH, label: "Harsh", color: "bg-truth-accentRed" },
    { id: ToneType.FUNNY, label: "Funny", color: "bg-amber-400" },
    { id: ToneType.DEEP, label: "Deep", color: "bg-purple-500" },
  ]

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkAction = async (action: 'READ' | 'ARCHIVE' | 'DELETE') => {
    if (selectedIds.length === 0) return
    await bulkMessageAction(selectedIds, action)
    setSelectedIds([])
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Top Controls: View Status & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex overflow-x-auto gap-0 border-2 border-truth-surface-border bg-truth-surface shrink-0 no-scrollbar">
           {statusTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setViewStatus(tab.id as 'INBOX' | 'ARCHIVED' | 'FAVORITES')}
               className={`flex items-center gap-2 px-3 sm:px-4 py-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex-1 justify-center
                 ${viewStatus === tab.id 
                   ? "bg-truth-on-surface text-truth-surface font-black" 
                   : "text-truth-on-surface-muted hover:text-truth-on-surface"}`}
             >
               <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
               <span className="hidden xs:inline">{tab.label}</span>
               <span className="xs:hidden">{tab.id}</span>
             </button>
           ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative group flex-1 min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-truth-on-surface-muted group-focus-within:text-truth-accentRed transition-colors" />
            <input 
              type="text" 
              placeholder="Search transmissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-truth-surface border-2 border-truth-surface-border p-3 pl-9 sm:pl-12 font-mono text-[10px] uppercase text-truth-on-surface focus:outline-none focus:border-truth-accentRed transition-all placeholder:text-truth-on-surface-muted/40"
            />
          </div>

          <button 
            onClick={() => setIsAnalyticsOpen(true)}
            className="p-2.5 sm:p-3 border-2 border-truth-surface-border text-truth-on-surface-muted hover:border-truth-accentBlue hover:text-truth-accentBlue transition-all bg-truth-surface shrink-0"
            title="Signal Intelligence"
          >
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={() => setIsExportOpen(true)}
            className="p-2.5 sm:p-3 border-2 border-truth-surface-border text-truth-on-surface-muted hover:border-truth-accentRed hover:text-truth-on-surface transition-all bg-truth-surface shrink-0"
            title="Export Protocol"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <AnalyticsView isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />

      {/* Filtering Header */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-start gap-3 sm:gap-8">
           <div className="flex items-center gap-2 shrink-0 mt-0.5">
             <Filter className="w-3.5 h-3.5 text-truth-accentRed" />
             <span className="font-mono text-[10px] font-black uppercase tracking-widest text-truth-on-surface">Filter:</span>
           </div>
           
           <div className="flex flex-wrap gap-2">
             {typeTabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveType(tab.id as MessageType | "ALL")}
                 className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-mono text-[9px] uppercase tracking-wider transition-all whitespace-nowrap
                   ${activeType === tab.id 
                     ? "border-truth-accentRed text-truth-accentRed bg-truth-accentRed/10 shadow-[4px_4px_0px_rgba(255,51,102,0.2)]" 
                     : "border-truth-surface-border text-truth-on-surface-muted hover:border-truth-on-surface hover:text-truth-on-surface"}`}
               >
                 <tab.icon className="w-3 h-3" />
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        <div className="flex flex-wrap items-start gap-3 sm:gap-8">
           <div className="flex items-center gap-2 shrink-0 mt-1">
             <div className="w-3.5 h-3.5" />
             <span className="font-mono text-[10px] font-black uppercase tracking-widest text-truth-on-surface">Tone:</span>
           </div>
           
           <div className="flex flex-wrap gap-2">
             {tones.map(tone => (
               <button
                 key={tone.id}
                 onClick={() => setActiveTone(tone.id as ToneType | "ALL")}
                 className={`flex items-center gap-1.5 px-2.5 py-1 border-b-2 transition-all whitespace-nowrap
                   ${activeTone === tone.id 
                     ? "border-truth-on-surface text-truth-on-surface" 
                     : "border-transparent text-truth-on-surface-muted hover:text-truth-on-surface"}`}
               >
                 <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${tone.color}`} />
                 <span className="font-mono text-[8px] uppercase tracking-widest">{tone.label}</span>
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-truth-nearBlack border-4 border-truth-accentRed p-4 px-8 shadow-[12px_12px_0px_rgba(255,51,102,0.2)]"
          >
            <div className="flex flex-col">
              <span className="font-bitter font-black text-xl text-truth-textLight leading-none">{selectedIds.length}</span>
              <span className="font-mono text-[8px] text-truth-textGray uppercase">Signals_Selected</span>
            </div>
            
            <div className="h-10 w-px bg-truth-midGray mx-2" />
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => handleBulkAction('READ')}
                className="flex flex-col items-center gap-1 group"
               >
                 <Eye className="w-5 h-5 text-truth-textLight group-hover:text-truth-accentGreen transition-colors" />
                 <span className="font-mono text-[8px] uppercase font-bold text-truth-textGray group-hover:text-truth-textLight">Read</span>
               </button>
               <button 
                onClick={() => handleBulkAction('ARCHIVE')}
                className="flex flex-col items-center gap-1 group"
               >
                 <Archive className="w-5 h-5 text-truth-textLight group-hover:text-truth-accentBlue transition-colors" />
                 <span className="font-mono text-[8px] uppercase font-bold text-truth-textGray group-hover:text-truth-textLight">Archive</span>
               </button>
               <button 
                onClick={() => handleBulkAction('DELETE')}
                className="flex flex-col items-center gap-1 group"
               >
                 <Trash2 className="w-5 h-5 text-truth-accentRed group-hover:scale-110 transition-all" />
                 <span className="font-mono text-[8px] uppercase font-bold text-truth-textGray group-hover:text-truth-accentRed">Burn</span>
               </button>
            </div>
            
            <button 
              onClick={() => setSelectedIds([])}
              className="ml-4 p-2 text-truth-textGray hover:text-truth-textLight border-l border-truth-midGray pl-6"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between px-2">
           <button 
              onClick={() => {
                if (selectedIds.length === filteredMessages.length) setSelectedIds([])
                else setSelectedIds(filteredMessages.map(m => m.id))
              }}
              className="flex items-center gap-2 font-mono text-[9px] uppercase font-bold text-truth-textGray hover:text-truth-textLight transition-colors"
           >
             {selectedIds.length === filteredMessages.length ? <CheckSquare className="w-4 h-4 text-truth-accentRed" /> : <Square className="w-4 h-4" />}
             Select_All_Packets
           </button>
           <span className="font-mono text-[9px] uppercase font-bold text-truth-textGray">
             Synchronizing {filteredMessages.length} Transmissions
           </span>
        </div>

        {filteredMessages.length > 0 ? (
          filteredMessages.map(msg => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              isSelected={selectedIds.includes(msg.id)}
              isSelectMode={selectedIds.length > 0}
              onSelect={handleSelect}
            />
          ))
        ) : (
          <div className="py-16 sm:py-24 text-center border-4 border-dashed border-truth-surface-border bg-truth-surface">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center rotate-45">
                <InboxIcon className="w-10 h-10 text-truth-textGray/40 -rotate-45" />
              </div>
            </div>
            <h2 className="font-bitter font-black text-2xl text-truth-textLight uppercase tracking-tighter">
              {initialMessages.length > 0 ? "FILTERED_VOID" : "NO_SIGNALS_DETECTED"}
            </h2>
            <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
              {initialMessages.length > 0 
                ? "No transmissions match the current protocol filters." 
                : "The secure channel is clear. No incoming data packets detected."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
