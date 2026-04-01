"use client"

import { TrendingUp, Zap, Link as LinkIcon, MessageSquare, Heart } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getTrendingPosts } from "@/lib/actions/post"
import { formatRelativeTime } from "@/lib/utils"
import type { PostWithRelations } from "@/lib/types/post"

export default function RightSidebar() {
  const [trending, setTrending] = useState<PostWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      const data = await getTrendingPosts(5)
      setTrending(data as PostWithRelations[])
      setIsLoading(false)
    }
    fetchTrending()
  }, [])

  return (
    <aside className="hidden xl:block w-80 sticky top-0 h-screen overflow-y-auto p-6 border-l border-truth-midGray/30 bg-truth-bg/50 backdrop-blur-md z-20">
      <div className="space-y-8">
        {/* Search Bar Placeholder */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="SEARCH_THE_TRUTH..." 
            className="w-full bg-truth-nearBlack border border-truth-midGray px-4 py-2 font-mono text-[10px] text-truth-textLight focus:outline-none focus:border-truth-accentBlue transition-all"
          />
        </div>

        {/* Trending Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-truth-accentRed" />
            <h2 className="font-mono text-xs font-black uppercase tracking-widest text-truth-textLight">
              TRENDING_TRUTHS
            </h2>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 bg-truth-midGray/20 w-3/4" />
                  <div className="h-2 bg-truth-midGray/10 w-1/2" />
                </div>
              ))
            ) : trending.length > 0 ? (
              trending.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block group">
                  <div className="p-3 border border-transparent hover:border-truth-midGray/30 hover:bg-truth-nearBlack/50 transition-all rounded-sm">
                    <p className="font-bitter text-xs text-truth-textLight line-clamp-2 mb-2 group-hover:text-truth-accentRed transition-colors">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 font-mono text-[8px] text-truth-textGray uppercase">
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
              <p className="font-mono text-[9px] text-truth-textGray uppercase italic">
                NO_SIGNALS_DETECTED_IN_ORBIT
              </p>
            )}
          </div>
        </section>

        {/* Protocol Directives (Related Links) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-truth-accentBlue" />
            <h2 className="font-mono text-xs font-black uppercase tracking-widest text-truth-textLight">
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
                 <span className="font-mono text-[10px] text-truth-textGray group-hover:text-truth-accentBlue transition-colors">
                   {item.label}
                 </span>
                 <LinkIcon className="w-3 h-3 text-truth-textGray/40 group-hover:text-truth-accentBlue transition-all" />
               </Link>
             ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="pt-8 border-t border-truth-midGray/20">
          <div className="font-mono text-[8px] text-truth-textGray uppercase tracking-widest leading-loose">
            <p>TRUTH_SIGNAL_PROTOCOL v4.0.2</p>
            <p>{new Date().getFullYear()} {" // ENCRYPTED_STREAM"}</p>
            <p>ALL_RIGHTS_RESERVED_BY_OBSERVER</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
