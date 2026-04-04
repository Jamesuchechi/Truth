"use client";

import {
  TrendingUp,
  Link as LinkIcon,
  MessageSquare,
  Heart,
  Ghost,
  UserPlus,
} from "lucide-react";
import Logo from "./Logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTrendingPosts } from "@/lib/actions/post";
import { getSuggestedShadows } from "@/lib/actions/feed";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types/post";
import type { SuggestedShadow } from "@/lib/types/user";

export default function RightSidebar() {
  const [trending, setTrending] = useState<PostWithRelations[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedShadow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [trendingData, shadowData] = await Promise.all([
        getTrendingPosts(5),
        getSuggestedShadows(3),
      ]);
      setTrending(trendingData as PostWithRelations[]);
      setSuggestions(shadowData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <aside className="border-border/10 bg-card/30 sticky top-0 z-20 hidden h-screen w-80 overflow-y-auto border-l backdrop-blur-xl xl:block">
      <div className="space-y-8 p-6">
        {/* Search Bar Placeholder */}
        <div className="relative">
          <input
            type="text"
            placeholder="SEARCH_THE_TRUTH..."
            className="bg-card border-border text-foreground focus:border-truth-accentBlue placeholder:text-muted/30 w-full border px-4 py-2 font-mono text-[10px] transition-all focus:outline-none"
          />
        </div>

        {/* Trending Section */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="text-truth-accentRed h-4 w-4" />
            <h2 className="text-foreground font-mono text-xs font-black tracking-widest uppercase">
              TRENDING_TRUTHS
            </h2>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="bg-muted/20 h-3 w-3/4" />
                  <div className="bg-muted/10 h-2 w-1/2" />
                </div>
              ))
            ) : trending.length > 0 ? (
              trending.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group block"
                >
                  <div className="hover:border-border hover:bg-card/50 rounded-sm border border-transparent p-3 transition-all">
                    <p className="font-bitter text-foreground group-hover:text-truth-accentRed mb-2 line-clamp-2 text-xs transition-colors">
                      {post.content}
                    </p>
                    <div className="text-muted flex items-center gap-4 font-mono text-[8px] uppercase">
                      <span className="flex items-center gap-1">
                        <Heart className="h-2 w-2" /> {post.reactionCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-2 w-2" />{" "}
                        {post.commentCount}
                      </span>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted font-mono text-[9px] uppercase italic">
                NO_SIGNALS_DETECTED_IN_ORBIT
              </p>
            )}
          </div>
        </section>

        {/* Suggested Shadows Section */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Ghost className="text-truth-accentBlue h-4 w-4" />
            <h2 className="text-foreground font-mono text-xs font-black tracking-widest uppercase">
              SHADOW_NODES_DETECTION
            </h2>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="bg-muted/20 h-8 w-8 rounded-sm" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted/20 h-2 w-3/4" />
                    <div className="bg-muted/10 h-2 w-1/2" />
                  </div>
                </div>
              ))
            ) : suggestions.length > 0 ? (
              suggestions.map((user) => (
                <div
                  key={user.id}
                  className="group flex items-center justify-between"
                >
                  <Link
                    href={`/${user.username}`}
                    className="flex items-center gap-3"
                  >
                    <div className="bg-card border-border text-truth-accentBlue group-hover:border-balance flex h-8 w-8 items-center justify-center border font-mono text-[10px] transition-colors">
                      ID
                    </div>
                    <div>
                      <p className="font-bitter text-foreground w-24 truncate text-[10px] font-black uppercase">
                        {user.shadowName || user.username}
                      </p>
                      <p className="text-muted font-mono text-[7px] uppercase">
                        Rep: {user.reputationTier}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href={`/${user.username}`}
                    className="border-border hover:border-truth-accentBlue hover:text-truth-accentBlue text-muted border p-1.5 transition-all hover:shadow-[0_0_10px_rgba(30,144,255,0.2)]"
                    title="Observe Node"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted font-mono text-[8px] uppercase italic">
                No nearby shadow signals...
              </p>
            )}
          </div>
        </section>

        {/* Protocol Directives (Related Links) */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Logo size={16} className="text-truth-accentBlue" />
            <h2 className="text-foreground font-mono text-xs font-black tracking-widest uppercase">
              PROTOCOL_DIRECTIVES
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { label: "ANON_IDENTITY_GUIDE", href: "/philosophy" },
              { label: "SIGNAL_STRENGTH_MAP", href: "/channels" },
              { label: "DEEP_DIVE_ARCHIVE", href: "/feed" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group flex items-center justify-between"
              >
                <span className="text-muted group-hover:text-truth-accentBlue font-mono text-[10px] transition-colors">
                  {item.label}
                </span>
                <LinkIcon className="text-muted/40 group-hover:text-truth-accentBlue h-3 w-3 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="border-border/20 border-t pt-8">
          <div className="text-muted font-mono text-[8px] leading-loose tracking-widest uppercase">
            <p>TRUTH_SIGNAL_PROTOCOL v4.0.2</p>
            <p>
              {new Date().getFullYear()} {" // ENCRYPTED_STREAM"}
            </p>
            <p>ALL_RIGHTS_RESERVED_BY_OBSERVER</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
