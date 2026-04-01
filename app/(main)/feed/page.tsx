import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"
import PostComposer from "@/components/feed/PostComposer"
import { PostCard } from "@/components/feed/PostCard"
import { Ghost, Terminal as TerminalIcon, ShieldAlert } from "lucide-react"

export default async function FeedPage() {
  const session = await auth()
  
  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      author: true,
      channel: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Feed Header */}
      <header className="mb-16 relative">
        <div className="flex items-end justify-between border-b-4 border-truth-midGray pb-6">
          <div>
            <h1 className="font-bitter font-black text-6xl text-truth-textLight tracking-tighter uppercase leading-none">
              FEED<span className="text-truth-accentRed">.IO</span>
            </h1>
            <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              <TerminalIcon className="w-3 h-3 text-truth-accentRed" /> LIVE_STREAM_PROTOCOL: ENABLED
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse" />
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse opacity-50" />
              <div className="w-2 h-2 bg-truth-accentGreen animate-pulse opacity-20" />
            </div>
            <span className="font-mono text-[9px] text-truth-textGray uppercase">NETWORK_LOAD: 12.4%</span>
          </div>
        </div>
      </header>

      {/* Post Composer */}
      {session?.user && (
        <PostComposer user={{ id: session.user.id }} />
      )}

      {/* Feed Content */}
      <div className="space-y-8">
        {(posts && posts.length > 0) ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="py-24 text-center border-4 border-dashed border-truth-midGray bg-truth-darkGray/30">
             <div className="mb-6 flex justify-center">
               <div className="w-20 h-20 bg-truth-nearBlack border-2 border-truth-midGray flex items-center justify-center rotate-45">
                 <Ghost className="w-10 h-10 text-truth-textGray/40 -rotate-45" />
               </div>
             </div>
             <h2 className="font-bitter font-black text-2xl text-truth-textLight uppercase tracking-tighter">THE VOID IS SILENT</h2>
             <p className="font-mono text-xs text-truth-textGray uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
               No active truths detected on this frequency. <br/>
               Initiate protocol and break the silence.
             </p>
             <button className="mt-8 px-8 py-3 bg-truth-accentRed/10 border border-truth-accentRed text-truth-accentRed font-mono text-[10px] uppercase font-bold hover:bg-truth-accentRed hover:text-truth-bg transition-all">
               EMIT_FIRST_TRUTH
             </button>
          </div>
        )}
      </div>

      {/* End of Feed Decoration */}
      {posts && posts.length > 0 && (
         <div className="mt-24 py-12 text-center border-t border-truth-midGray">
            <div className="flex items-center justify-center gap-4 text-truth-textGray">
               <ShieldAlert className="w-5 h-5 opacity-30" />
               <span className="font-mono text-[9px] uppercase tracking-[0.5em]">SYSTEM_END_OF_STREAM</span>
               <ShieldAlert className="w-5 h-5 opacity-30" />
            </div>
         </div>
      )}
    </div>
  )
}
