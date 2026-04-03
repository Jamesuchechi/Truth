import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import { Ghost, Terminal as TerminalIcon, ShieldAlert } from "lucide-react"
import { postInclude } from "@/lib/types/post"
import FeedClient from "./FeedClient"
import { PostCard } from "@/components/feed/PostCard"

export default async function FeedPage() {
  const session = await auth()
  
  // Fetch General Posts (Non-story)
  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      visibilityType: { not: "STORY" },
      parentId: null,
    },
    include: postInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  })

  // Fetch Active Stories (within 24h)
  const stories = await prisma.post.findMany({
    where: {
      visibilityType: "STORY",
      deletedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take: 15,
  })

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {/* Feed Header - Twitch Style Pulse */}
      <header className="mb-12 relative overflow-hidden">
        <div className="flex items-end justify-between border-b-4 border-truth-midGray pb-6 relative z-10">
          <div>
            <h1 className="font-bitter font-black text-6xl text-foreground tracking-tighter uppercase leading-none">
              TRUTH<span className="text-truth-accentRed animate-pulse">_SIGNAL</span>
            </h1>
            <p className="font-mono text-xs text-muted uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              <TerminalIcon className="w-3 h-3 text-truth-accentRed" /> PROTOCOL_V03.1 // BROADCAST_SYNC: ACTIVE
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 text-right">
             <div className="px-3 py-1 bg-truth-accentRed/10 border border-truth-accentRed/30 mb-1">
                <span className="font-mono text-[9px] text-truth-accentRed uppercase font-black tracking-widest">LIVE_FEED</span>
             </div>
             <span className="font-mono text-[8px] text-truth-textGray uppercase tracking-tighter">LATENCY: 12ms // BUFFER: ENABLED</span>
          </div>
        </div>
        
        {/* Background Decorative Scanline */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-truth-accentRed/20 shadow-[0_0_15px_rgba(255,51,102,0.4)]" />
      </header>

      {/* Feed Client - Handles Stories, Composer Modal and FAB */}
      {session?.user && (
        <FeedClient 
          initialPosts={posts} 
          stories={stories} 
          user={{ id: session.user.id }} 
        />
      )}

      {!session?.user && (
         <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
         </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
          <div className="py-24 text-center border-4 border-dashed border-truth-midGray bg-truth-darkGray/30">
             <div className="mb-6 flex justify-center">
               <div className="w-20 h-20 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center rotate-45">
                 <Ghost className="w-10 h-10 text-truth-textGray/40 -rotate-45" />
               </div>
             </div>
             <h2 className="font-bitter font-black text-2xl text-truth-textLight uppercase tracking-tighter">VOID_DETECTED</h2>
             <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
               No active frequency detected. <br/>
               Synchronize your truth and emit signal.
             </p>
          </div>
      )}

      {/* Footer Decoration */}
      <div className="mt-24 py-12 text-center border-t border-truth-midGray">
        <div className="flex items-center justify-center gap-4 text-truth-textGray">
          <ShieldAlert className="w-5 h-5 opacity-30" />
          <span className="font-mono text-[9px] uppercase tracking-[0.5em]">SYSTEM_END_OF_STREAM</span>
          <ShieldAlert className="w-5 h-5 opacity-30" />
        </div>
      </div>
    </div>
  )
}
