import { getChannels } from "@/lib/actions/channel"
import ChannelCard from "@/components/channels/ChannelCard"
import { Hash, Search, SlidersHorizontal, Signal, Zap } from "lucide-react"

export default async function ChannelsPage() {
  const channels = await getChannels()

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-fadeIn">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-truth-surface border-2 border-truth-surface-border p-8 sm:p-12">
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-truth-accentRed">
             <div className="w-2 h-2 bg-truth-accentRed shadow-[0_0_8px_rgba(255,51,102,0.6)]" />
             Protocol Channel Matrix
           </div>
           <h1 className="font-bitter text-5xl font-black text-truth-textLight tracking-tighter uppercase leading-[0.9]">
             CHANNELS_<span className="text-truth-accentRed">V2.0</span>
           </h1>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none pr-8 pt-8 flex justify-end">
           <Hash className="w-64 h-64 text-truth-textGray" />
        </div>
        <div className="absolute bottom-4 right-12 flex items-center gap-6 font-mono text-[8px] text-truth-textGray uppercase tracking-[0.2em] opacity-40">
           <div className="flex items-center gap-2"><Zap className="w-2 h-2" /> TOTAL_CHANNELS: {channels.length}</div>
           <div className="flex items-center gap-2"><Signal className="w-2 h-2" /> ACTIVE_SIGNALS: {channels.reduce((acc, c) => acc + c._count.posts, 0)}</div>
        </div>
      </section>

      {/* Filter & Search Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-truth-on-surface-muted group-focus-within:text-truth-accentRed transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH_SIGNAL_ID // FILTER_CHANNELS..."
              className="w-full bg-truth-surface border-2 border-truth-surface-border py-4 pl-12 pr-4 font-mono text-[10px] uppercase tracking-widest text-truth-on-surface placeholder:text-truth-on-surface-muted/40 focus:border-truth-accentRed outline-none transition-all"
            />
         </div>
         <button className="bg-truth-surface border-2 border-truth-surface-border py-4 px-6 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest text-truth-on-surface-muted hover:text-truth-on-surface hover:border-truth-on-surface transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            ADVANCED_FILTERS
         </button>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-12 text-center border-t border-truth-midGray/30">
         <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest leading-loose">
           PROXIMITY_PROTOCOL: ENSURE_STEALTH_AT_ALL_TIMES // NO_LEAKS_DETECTED <br/>
           ENCRYPTION: AES-256-GCM // TRUTH_IS_PERSONAL
         </p>
      </div>
    </div>
  )
}