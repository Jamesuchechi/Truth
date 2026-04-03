import { getChannelBySlug } from "@/lib/actions/channel"
import { getPosts } from "@/lib/actions/post"
import { notFound } from "next/navigation"
import ChannelHeader from "@/components/channels/ChannelHeader"
import { PostCard } from "@/components/feed/PostCard"
import PostComposer from "@/components/feed/PostComposer"
import { auth } from "@/auth"
import type { PostWithRelations } from "@/lib/types/post"

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function ChannelPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  
  const channel = await getChannelBySlug(slug)
  if (!channel) {
    notFound()
  }

  const posts = await getPosts({ channelId: channel.id })

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-fadeIn relative z-10">
      {/* Channel Identity */}
      <ChannelHeader 
        channel={channel} 
        isSubscribed={channel.isSubscribed} 
      />

      {/* Composer - Context Aware */}
      <div className="relative z-20">
         <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-truth-textGray mb-4 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-truth-accentGreen animate-pulse" />
            Active Channel Frequency: {channel.name}
         </div>
         <PostComposer 
           user={session?.user as { id: string }} 
           defaultChannelId={channel.id}
         />
      </div>

      {/* Channel Feed */}
      <div className="space-y-8 relative z-10">
        <div className="flex items-center justify-between border-b-2 border-truth-midGray pb-4">
           <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
             <div className="w-2 h-8" style={{ backgroundColor: channel.color || "#FF3366" }} />
             Frequency Pulses
           </h2>
           <div className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest">
             TOTAL_TRANSMISSIONS: [{channel._count.posts}]
           </div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: PostWithRelations) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="p-20 border-2 border-dashed border-truth-midGray text-center rounded-lg bg-truth-nearBlack/50">
             <p className="font-mono text-xs text-truth-textGray uppercase tracking-[0.2em] mb-2">No active signals detected on this frequency.</p>
             <p className="font-bitter text-sm text-truth-textGray italic">&quot;Be the first to break the silence.&quot;</p>
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div 
        className="fixed top-0 right-0 w-[500px] h-[500px] blur-[150px] opacity-5 pointer-events-none z-0"
        style={{ backgroundColor: channel.color || "#FF3366" }}
      />
    </div>
  )
}
