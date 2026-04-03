"use client"

import { TrendingUp, Zap, Link as LinkIcon, MessageSquare, Heart, Ghost, UserPlus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getTrendingPosts } from "@/lib/actions/post"
import { getSuggestedShadows } from "@/lib/actions/feed"
import { formatRelativeTime } from "@/lib/utils"
import type { PostWithRelations } from "@/lib/types/post"
import type { SuggestedShadow } from "@/lib/types/user"

export default function RightSidebar() {
  const [trending, setTrending] = useState<PostWithRelations[]>([])
  const [suggestions, setSuggestions] = useState<SuggestedShadow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [trendingData, shadowData] = await Promise.all([
        getTrendingPosts(5),
        getSuggestedShadows(3)
      ])
      setTrending(trendingData as PostWithRelations[])
      setSuggestions(shadowData)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  return (
    <aside className="hidden xl:block w-80 sticky top-0 h-screen overflow-y-auto p-6 border-l border-border/30 bg-background/50 backdrop-blur-md z-20">
      <div className="space-y-8">
        {/* Search Bar Placeholder */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="SEARCH_THE_TRUTH..." 
            className="w-full bg-card border border-border px-4 py-2 font-mono text-[10px] text-foreground focus:outline-none focus:border-truth-accentBlue transition-all placeholder:text-muted/30"
          />
        </div>

        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-truth-accentRed" />
            <h2 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              TRENDING_TRUTHS
            </h2>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 bg-muted/20 w-3/4" />
                  <div className="h-2 bg-muted/10 w-1/2" />
                </div>
              ))
            ) : trending.length > 0 ? (
              trending.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block group">
                  <div className="p-3 border border-transparent hover:border-border hover:bg-card/50 transition-all rounded-sm">
                    <p className="font-bitter text-xs text-foreground line-clamp-2 mb-2 group-hover:text-truth-accentRed transition-colors">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 font-mono text-[8px] text-muted uppercase">
                      <span className="flex items-center gap-1">
                        <Heart className="w-2 h-2" /> {post.reactionCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-2 h-2" /> {post.commentCount}
                      </span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="font-mono text-[9px] text-muted uppercase italic">
                NO_SIGNALS_DETECTED_IN_ORBIT
              </p>
            )}
          </div>
        </section>

        {/* Suggested Shadows Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Ghost className="w-4 h-4 text-truth-accentBlue" />
            <h2 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              SHADOW_NODES_DETECTION
            </h2>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted/20 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-muted/20 w-3/4" />
                    <div className="h-2 bg-muted/10 w-1/2" />
                  </div>
                </div>
              ))
            ) : suggestions.length > 0 ? (
              suggestions.map((user) => (
                <div key={user.id} className="flex items-center justify-between group">
                  <Link href={`/${user.username}`} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-card border border-border flex items-center justify-center font-mono text-[10px] text-truth-accentBlue group-hover:border-balance transition-colors">
                      ID
                    </div>
                    <div>
                      <p className="font-bitter text-[10px] font-black text-foreground uppercase truncate w-24">
                        {user.shadowName || user.username}
                      </p>
                      <p className="font-mono text-[7px] text-muted uppercase">
                        Rep: {user.reputationTier}
                      </p>
                    </div>
                  </Link>
                  <Link 
                    href={`/${user.username}`}
                    className="p-1.5 border border-border hover:border-truth-accentBlue hover:text-truth-accentBlue transition-all text-muted hover:shadow-[0_0_10px_rgba(30,144,255,0.2)]"
                    title="Observe Node"
                  >
                    <UserPlus className="w-3 h-3" />
                  </Link>
                </div>
              ))
            ) : (
              <p className="font-mono text-[8px] text-muted uppercase italic">
                No nearby shadow signals...
              </p>
            )}
          </div>
        </section>

        {/* Protocol Directives (Related Links) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-truth-accentBlue" />
            <h2 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              PROTOCOL_DIRECTIVES
            </h2>
          </div>
          
          <div className="space-y-3">
             {[
               { label: "ANON_IDENTITY_GUIDE", href: "/philosophy" },
               { label: "SIGNAL_STRENGTH_MAP", href: "/channels" },
               { label: "DEEP_DIVE_ARCHIVE", href: "/feed" },
             ].map((item, i) => (
               <Link key={i} href={item.href} className="flex items-center justify-between group">
                 <span className="font-mono text-[10px] text-muted group-hover:text-truth-accentBlue transition-colors">
                   {item.label}
                 </span>
                 <LinkIcon className="w-3 h-3 text-muted/40 group-hover:text-truth-accentBlue transition-all" />
               </Link>
             ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="pt-8 border-t border-border/20">
          <div className="font-mono text-[8px] text-muted uppercase tracking-widest leading-loose">
            <p>TRUTH_SIGNAL_PROTOCOL v4.0.2</p>
            <p>{new Date().getFullYear()} {" // ENCRYPTED_STREAM"}</p>
            <p>ALL_RIGHTS_RESERVED_BY_OBSERVER</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
