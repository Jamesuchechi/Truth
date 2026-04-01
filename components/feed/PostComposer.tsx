"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { 
  Send, 
  Eye, 
  Clock, 
  Ghost, 
  Smile, 
  Type, 
  Plus, 
  X,
  AlertCircle,
  Hash
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import EmojiPicker, { Theme, Categories, type EmojiClickData } from "emoji-picker-react"
import { createPost, createThread } from "@/lib/actions/post"
import { getChannels } from "@/lib/actions/channel"
import MediaUploader from "./MediaUploader"

type PostType = "STANDARD" | "STORY" | "THREAD" | "LIMITED"

interface NodeMedia {
  url: string
  type: "IMAGE" | "VIDEO" | "AUDIO"
}

export default function PostComposer({ 
  user: _user,
  defaultChannelId 
}: { 
  user: { id: string },
  defaultChannelId?: string
}) {
  const [activeType, setActiveType] = useState<PostType>("STANDARD")
  const [nodes, setNodes] = useState<string[]>([""])
  const [nodeMedia, setNodeMedia] = useState<NodeMedia[][]>([[]]) // Media array per node
  const [useShadow, setUseShadow] = useState(false)
  const [channelId, setChannelId] = useState<string | undefined>(defaultChannelId)
  const [channels, setChannels] = useState<{id: string, name: string}[]>([])
  const [viewsLimit, setViewsLimit] = useState<number>(50)
  const [isPreview, setIsPreview] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [lastFocusedIndex, setLastFocusedIndex] = useState(0)
  
  // Ref for the last textarea to focus when adding thread node
  const lastRef = useRef<HTMLTextAreaElement>(null)

  // Fetch channels for the selector
  useEffect(() => {
    const fetchChannels = async () => {
      const data = await getChannels()
      setChannels(data.map(c => ({ id: c.id, name: c.name })))
    }
    fetchChannels()
  }, [])

  // Auto-save drafts
  useEffect(() => {
    const saved = localStorage.getItem("truth-draft")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        startTransition(() => {
          setNodes(data.nodes || [""])
          setNodeMedia(data.nodeMedia || [[]])
          setActiveType(data.type || "STANDARD")
          setUseShadow(data.useShadow || false)
          if (!defaultChannelId) setChannelId(data.channelId)
          setViewsLimit(data.viewsLimit || 50)
        })
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  
  }, [defaultChannelId])

  useEffect(() => {
    localStorage.setItem("truth-draft", JSON.stringify({ nodes, nodeMedia, type: activeType, useShadow, channelId, viewsLimit }))
  }, [nodes, nodeMedia, activeType, useShadow, channelId, viewsLimit])

  const handleAddNode = () => {
    if (nodes.length < 5) {
      setNodes([...nodes, ""])
      setNodeMedia([...nodeMedia, []])
      setLastFocusedIndex(nodes.length)
    }
  }

  const handleUpdateNode = (index: number, val: string) => {
    const newNodes = [...nodes]
    newNodes[index] = val.slice(0, 2000)
    setNodes(newNodes)
    setError(null)
  }

  const handleRemoveNode = (index: number) => {
    if (nodes.length > 1) {
      setNodes(nodes.filter((_, i) => i !== index))
      setNodeMedia(nodeMedia.filter((_, i) => i !== index))
      setLastFocusedIndex(Math.max(0, index - 1))
    }
  }

  const handleMediaChange = (index: number, media: NodeMedia[]) => {
    const newNodeMedia = [...nodeMedia]
    newNodeMedia[index] = media
    setNodeMedia(newNodeMedia)
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const newNodes = [...nodes]
    newNodes[lastFocusedIndex] += emojiData.emoji
    setNodes(newNodes)
    setShowEmoji(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (nodes.some(n => !n.trim())) {
      setError("Nodes cannot be empty.")
      return
    }

    startTransition(async () => {
      let result
      if (activeType === "THREAD") {
        const threadContents = nodes.map((content, idx) => ({
          content,
          media: nodeMedia[idx]
        }))
        result = await createThread(threadContents, useShadow, channelId)
      } else {
        const formData = new FormData()
        formData.append("content", nodes[0])
        formData.append("useShadow", String(useShadow))
        formData.append("visibility", activeType === "STORY" ? "STORY" : activeType === "LIMITED" ? "LIMITED" : "PUBLIC")
        if (activeType === "LIMITED") formData.append("viewsLimit", String(viewsLimit))
        if (channelId) formData.append("channelId", channelId)
        if (nodeMedia[0]?.length > 0) {
          formData.append("media", JSON.stringify(nodeMedia[0]))
        }
        result = await createPost(formData)
      }

      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Validation failed.")
      } else {
        setNodes([""])
        setNodeMedia([[]])
        localStorage.removeItem("truth-draft")
        setIsPreview(false)
      }
    })
  }

  const charCount = nodes[0].length

  return (
    <div className="relative mb-16 max-w-3xl mx-auto">
      {/* Type Selector Tabs */}
      <div className="flex gap-1 mb-0.5">
        {(["STANDARD", "STORY", "THREAD"] as PostType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveType(t)
              if (t !== "THREAD") {
                setNodes([nodes[0]])
                setNodeMedia([nodeMedia[0]])
              }
            }}
            className={`
              px-6 py-2 font-mono text-[10px] uppercase tracking-widest transition-all
              ${activeType === t 
                ? "bg-truth-nearBlack text-truth-accentRed border-2 border-truth-midGray border-b-truth-nearBlack z-10 -mb-[2px]" 
                : "bg-truth-nearBlack/40 text-truth-textGray border-2 border-truth-midGray/50 hover:text-truth-textLight"}
            `}
          >
          </button>
        ))}
        {(["LIMITED"] as PostType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveType(t)
              setNodes([nodes[0]])
              setNodeMedia([nodeMedia[0]])
            }}
            className={`
              px-6 py-2 font-mono text-[10px] uppercase tracking-widest transition-all
              ${activeType === t 
                ? "bg-truth-nearBlack text-truth-accentBlue border-2 border-truth-midGray border-b-truth-nearBlack z-10 -mb-[2px]" 
                : "bg-truth-nearBlack/40 text-truth-textGray border-2 border-truth-midGray/50 hover:text-truth-textLight"}
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Terminal Header */}
      <div className="bg-truth-nearBlack border-2 border-truth-midGray p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 bg-truth-accentRed shadow-[0_0_5px_rgba(255,51,102,0.5)]" />
              <div className="w-2.5 h-2.5 bg-truth-accentBlue opacity-50" />
              <div className="w-2.5 h-2.5 bg-truth-accentPurple opacity-50" />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-truth-textGray ml-2 truncate">
              {activeType}_COMPOSER_v2.0 // NODE_{nodes.length}
            </span>
        </div>
        
        <div className="flex items-center gap-4">
           {useShadow && (
             <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="font-mono text-[8px] uppercase text-truth-accentRed flex items-center gap-1"
             >
               <Ghost className="w-3 h-3" /> MASK_ENABLED
             </motion.div>
           )}
           <div className="h-3 w-px bg-truth-midGray" />
           <span className={`font-mono text-[9px] transition-colors ${charCount > 1800 ? "text-truth-accentRed" : "text-truth-textGray"}`}>
             {charCount}/2000
           </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="bg-truth-nearBlack border-2 border-t-0 border-truth-midGray shadow-[15px_15px_0px_rgba(0,0,0,0.4)]">
          {/* Node Editor(s) */}
          <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            {nodes.map((node, i) => (
              <div key={i} className="relative group/node space-y-4">
                {activeType === "THREAD" && (
                  <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-truth-midGray group-last/node:h-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-truth-accentRed" />
                  </div>
                )}
                
                <div className="relative">
                  {isPreview ? (
                    <div className="min-h-[100px] p-4 bg-truth-darkGray/30 border border-truth-midGray/30 prose prose-invert prose-sm max-w-none font-bitter">
                      <ReactMarkdown>{node || "_No transmission detected..._"}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      ref={i === nodes.length - 1 ? lastRef : null}
                      onFocus={() => setLastFocusedIndex(i)}
                      value={node}
                      onChange={(e) => handleUpdateNode(i, e.target.value)}
                      placeholder={i === 0 ? "ENTRY_POINT: Render your truth in markdown..." : "NEXT_NODE: Continue the signal..."}
                      className="w-full bg-transparent border-none focus:ring-0 text-truth-textLight font-bitter text-lg resize-none min-h-[120px] placeholder:text-truth-textGray/20 placeholder:italic"
                    />
                  )}
                  
                  {activeType === "THREAD" && nodes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveNode(i)}
                      className="absolute top-0 right-0 p-1 opacity-0 group-hover/node:opacity-100 transition-all text-truth-textGray hover:text-truth-accentRed"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Media Uploader for this node */}
                {!isPreview && (
                   <MediaUploader 
                     onMediaChange={(media) => handleMediaChange(i, media)} 
                     maxFiles={4}
                   />
                )}
              </div>
            ))}

            {activeType === "THREAD" && nodes.length < 5 && !isPreview && (
              <button
                type="button"
                onClick={handleAddNode}
                className="flex items-center gap-2 font-mono text-[9px] text-truth-accentBlue hover:text-truth-textLight uppercase tracking-widest transition-colors py-2"
              >
                <Plus className="w-3 h-3" /> ATTACH_NEXT_SIGNAL
              </button>
            )}
          </div>

          {/* Error Signal */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-truth-accentRed/10 border-y border-truth-accentRed/30 px-6 py-2 flex items-center gap-2"
              >
                <AlertCircle className="w-3 h-3 text-truth-accentRed" />
                <span className="font-mono text-[9px] text-truth-accentRed uppercase tracking-widest">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Control Bar */}
          <div className="px-6 py-4 border-t border-truth-midGray flex flex-wrap items-center justify-between gap-4 bg-truth-nearBlack/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
               {/* Identity Toggle */}
               <button
                 type="button"
                 onClick={() => setUseShadow(!useShadow)}
                 className={`p-2 transition-all group relative ${useShadow ? "text-truth-accentRed" : "text-truth-textGray"}`}
                 title="Identity Switch"
               >
                 <Ghost className={`w-5 h-5 ${useShadow ? "animate-pulse" : ""}`} />
                 <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-current opacity-20" />
               </button>

               <div className="w-px h-6 bg-truth-midGray/50" />

               {/* Channel Selector */}
               {channels.length > 0 && (
                 <div className="flex items-center gap-2 px-3 py-1.5 border border-truth-midGray/50 bg-truth-darkGray/50 group/select focus-within:border-truth-accentRed transition-all">
                    <Hash className="w-3.5 h-3.5 text-truth-textGray group-focus-within/select:text-truth-accentRed" />
                    <select 
                      value={channelId || ""} 
                      onChange={(e) => setChannelId(e.target.value || undefined)}
                      disabled={!!defaultChannelId}
                      className="bg-transparent border-none focus:ring-0 font-mono text-[9px] text-truth-textLight uppercase tracking-widest outline-none cursor-pointer disabled:cursor-default disabled:opacity-70"
                    >
                      <option value="" className="bg-truth-nearBlack text-truth-textGray italic">Global_Broadcast</option>
                      {channels.map(c => (
                        <option key={c.id} value={c.id} className="bg-truth-nearBlack">{c.name}_Signal</option>
                      ))}
                    </select>
                 </div>
               )}

               <div className="w-px h-6 bg-truth-midGray/50" />

               {/* Mode Toggles */}
               <button
                 type="button"
                 onClick={() => setIsPreview(!isPreview)}
                 className={`p-2 transition-all ${isPreview ? "text-truth-accentBlue" : "text-truth-textGray"}`}
                 title="Toggle Preview"
               >
                 {isPreview ? <Type className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
               </button>

               <div className="relative">
                 <button
                   type="button"
                   onClick={() => setShowEmoji(!showEmoji)}
                   className={`p-2 transition-all ${showEmoji ? "text-truth-accentPurple" : "text-truth-textGray"}`}
                   title="Emoji Matrix"
                 >
                   <Smile className="w-5 h-5" />
                 </button>
                 
                 <AnimatePresence>
                   {showEmoji && (
                     <div className="absolute bottom-full left-0 mb-4 z-50">
                       <motion.div
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                         className="relative"
                       >
                         {/* Close Button overlay */}
                         <button 
                            type="button"
                            onClick={() => setShowEmoji(false)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-truth-accentRed text-truth-bg rounded-full flex items-center justify-center z-50 shadow-lg hover:scale-110 transition-transform"
                         >
                           <X className="w-3 h-3" />
                         </button>

                         <EmojiPicker 
                           theme={Theme.DARK}
                           onEmojiClick={onEmojiClick}
                           autoFocusSearch={false}
                           lazyLoadEmojis={true}
                           categories={[
                             { category: Categories.SUGGESTED, name: "SUGGESTED" },
                             { category: Categories.SMILEYS_PEOPLE, name: "SMILEYS" },
                             { category: Categories.ANIMALS_NATURE, name: "NATURE" },
                             { category: Categories.FOOD_DRINK, name: "FOOD" },
                             { category: Categories.TRAVEL_PLACES, name: "TRAVEL" },
                             { category: Categories.ACTIVITIES, name: "ACTIVITIES" },
                             { category: Categories.OBJECTS, name: "OBJECTS" },
                             { category: Categories.SYMBOLS, name: "SYMBOLS" }
                           ]}
                           style={{
                             backgroundColor: "#0D0D0D",
                             borderColor: "#1A1A1A",
                             boxShadow: "10px 10px 30px rgba(0,0,0,0.5)",
                             fontFamily: "Bitter, serif",
                             '--epr-bg-color': '#0D0D0D',
                             '--epr-category-label-bg-color': '#0D0D0D',
                             '--epr-picker-border-color': '#1A1A1A',
                             '--epr-search-input-bg-color': '#1A1A1A',
                             '--epr-highlight-color': '#FF3366',
                             '--epr-header-padding': '15px'
                           } as React.CSSProperties}
                         />
                       </motion.div>
                     </div>
                   )}
                 </AnimatePresence>
               </div>

               {activeType === "STORY" && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-truth-accentRed/5 border border-truth-accentRed/20">
                    <Clock className="w-3 h-3 text-truth-accentRed" />
                    <span className="font-mono text-[8px] text-truth-accentRed uppercase tracking-widest">24h_LIMIT</span>
                 </div>
               )}

               {activeType === "LIMITED" && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-truth-accentBlue/5 border border-truth-accentBlue/20">
                   <Eye className="w-3 h-3 text-truth-accentBlue" />
                   <span className="font-mono text-[8px] text-truth-accentBlue uppercase tracking-widest mr-2">CAP_SIGNAL:</span>
                   <select 
                     value={viewsLimit}
                     onChange={(e) => setViewsLimit(Number(e.target.value))}
                     className="bg-transparent border-none focus:ring-0 font-mono text-[8px] text-truth-textLight uppercase outline-none cursor-pointer p-0"
                   >
                     {[20, 50, 100, 500].map(v => (
                       <option key={v} value={v} className="bg-truth-nearBlack font-mono text-[9px]">{v}_OBSERVERS</option>
                     ))}
                   </select>
                 </div>
               )}
            </div>

            <button
              type="submit"
              disabled={isPending || !nodes[0].trim()}
              className={`
                px-10 py-3 bg-truth-accentRed text-truth-bg font-mono font-black text-[12px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all relative overflow-hidden group
                ${(isPending || !nodes[0].trim()) ? "opacity-30 grayscale cursor-not-allowed" : "hover:shadow-[0_0_20px_rgba(255,51,102,0.4)] active:scale-95"}
              `}
            >
              <span className="relative z-10 flex items-center gap-3">
                {isPending ? "SYNCHING..." : "EXECUTE_TRUTH"}
                <Send className={`w-4 h-4 ${isPending ? "animate-ping" : "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"}`} />
              </span>
              <motion.div 
                className="absolute inset-0 bg-white/10 translate-x-full"
                whileHover={{ translateX: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </button>
          </div>
        </div>
      </form>

      {/* Aesthetic Accents */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-32 bg-truth-midGray opacity-20" />
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-32 bg-truth-midGray opacity-20" />
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-[7px] text-truth-textGray tracking-[0.8em] pointer-events-none opacity-30">
        ENCRYPTION_PROTOCOL_v4.0.2_SECURE
      </div>
    </div>
  )
}
