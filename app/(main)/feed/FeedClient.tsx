"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { PostCard } from "@/components/feed/PostCard";
import type { PostWithRelations } from "@/lib/types/post";
import {
  getForYouFeed,
  getFreshFeed,
  getFollowingFeed,
  getTrendingFeed,
  getDeepDiveFeed,
  getQuickHitsFeed,
} from "@/lib/actions/feed";
import {
  Plus,
  Wifi,
  WifiOff,
  Ghost,
  Flame,
  BookOpen,
  Zap,
  Compass,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import StoriesBar from "@/components/feed/StoriesBar";
import ComposeModal from "@/components/feed/ComposeModal";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { db } from "@/lib/db/offline";

type FeedTab =
  | "FOR_YOU"
  | "FRESH"
  | "FOLLOWING"
  | "TRENDING"
  | "DEEP_DIVE"
  | "QUICK_HITS";

interface FeedClientProps {
  initialPosts: PostWithRelations[];
  stories: PostWithRelations[];
  user: {
    id: string;
    shadowName?: string | null;
    defaultShadowMode?: boolean;
  };
}

interface FeedState {
  posts: PostWithRelations[];
  cursor: string | null;
  hasMore: boolean;
}

export default function FeedClient({
  initialPosts,
  stories,
  user,
}: FeedClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>("FOR_YOU");
  const [feeds, setFeeds] = useState<Record<FeedTab, FeedState>>({
    FOR_YOU: {
      posts: initialPosts,
      cursor:
        initialPosts.length > 0
          ? initialPosts[initialPosts.length - 1].id
          : null,
      hasMore: true,
    },
    FRESH: { posts: [], cursor: null, hasMore: true },
    FOLLOWING: { posts: [], cursor: null, hasMore: true },
    TRENDING: { posts: [], cursor: null, hasMore: true },
    DEEP_DIVE: { posts: [], cursor: null, hasMore: true },
    QUICK_HITS: { posts: [], cursor: null, hasMore: true },
  });
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  const { isOnline } = useOfflineSync();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(
    async (tab: FeedTab, cursor?: string | null) => {
      if (!isOnline) {
        // Load from IndexedDB when offline
        const cachedPosts = await db.posts
          .where("id")
          .notEqual("") // Get all for simplicity, or filter by tab if we added tab to schema
          .limit(20)
          .toArray();

        return { posts: cachedPosts as PostWithRelations[], nextCursor: null };
      }

      let res: { posts: PostWithRelations[]; nextCursor: string | null };
      switch (tab) {
        case "FOR_YOU":
          res = await getForYouFeed(20, cursor || undefined);
          break;
        case "FRESH":
          res = await getFreshFeed(20, cursor || undefined);
          break;
        case "FOLLOWING":
          res = await getFollowingFeed(20, cursor || undefined);
          break;
        case "TRENDING":
          res = await getTrendingFeed(20, cursor || undefined);
          break;
        case "DEEP_DIVE":
          res = await getDeepDiveFeed(10, cursor || undefined);
          break;
        case "QUICK_HITS":
          res = await getQuickHitsFeed(15, cursor || undefined);
          break;
      }

      // Cache to IndexedDB when online
      if (res.posts.length > 0) {
        const offlinePosts = res.posts.map((post) => ({
          ...post,
          cachedAt: Date.now(),
        }));
        await db.posts.bulkPut(offlinePosts);
      }

      return res;
    },
    [isOnline]
  );

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    if (feeds[tab].posts.length === 0) {
      startTransition(async () => {
        const res = await fetchFeed(tab);
        setFeeds((prev) => ({
          ...prev,
          [tab]: {
            posts: res.posts,
            cursor: res.nextCursor,
            hasMore: !!res.nextCursor,
          },
        }));
      });
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !feeds[activeTab].hasMore) return;

    setIsLoadingMore(true);
    const currentCursor = feeds[activeTab].cursor;
    const res = await fetchFeed(activeTab, currentCursor);

    setFeeds((prev) => ({
      ...prev,
      [activeTab]: {
        posts: [...prev[activeTab].posts, ...res.posts],
        cursor: res.nextCursor,
        hasMore: !!res.nextCursor,
      },
    }));
    setIsLoadingMore(false);
  }, [activeTab, feeds, fetchFeed, isLoadingMore]);

  const handleRefresh = useCallback(async () => {
    if (isPending || isRefreshing) return;

    setIsRefreshing(true);
    if ("vibrate" in navigator) navigator.vibrate(10);

    startTransition(async () => {
      const res = await fetchFeed(activeTab);
      setFeeds((prev) => ({
        ...prev,
        [activeTab]: {
          posts: res.posts,
          cursor: res.nextCursor,
          hasMore: !!res.nextCursor,
        },
      }));
      setIsRefreshing(false);
      setPullProgress(0);
      if ("vibrate" in navigator) navigator.vibrate([10, 30, 10]);
    });
  }, [activeTab, fetchFeed, isPending, isRefreshing]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          feeds[activeTab].hasMore &&
          !isPending &&
          !isLoadingMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" } // Prefetch when 200px from bottom
    );

    const currentTarget = observerTarget.current;

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadMore, activeTab, feeds, isPending, isLoadingMore]);

  const displayedPosts = feeds[activeTab].posts;

  return (
    <>
      <div className="-mx-3 mb-8 overflow-hidden sm:-mx-4 sm:mb-10 md:mx-0">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-3 pb-3 sm:gap-3 sm:px-4 md:mx-0">
          {[
            {
              id: "FOR_YOU",
              label: "FOR_YOU",
              icon: Compass,
              color: "text-truth-accentRed",
              border: "border-truth-accentRed",
            },
            {
              id: "FRESH",
              label: "FRESH",
              icon: Clock,
              color: "text-truth-accentGreen",
              border: "border-truth-accentGreen",
            },
            {
              id: "FOLLOWING",
              label: "OBSERVING",
              icon: Wifi,
              color: "text-truth-accentBlue",
              border: "border-truth-accentBlue",
            },
            {
              id: "TRENDING",
              label: "TRENDING",
              icon: Flame,
              color: "text-truth-accentYellow",
              border: "border-truth-accentYellow",
            },
            {
              id: "DEEP_DIVE",
              label: "DEEP",
              icon: BookOpen,
              color: "text-truth-accentPurple",
              border: "border-truth-accentPurple",
            },
            {
              id: "QUICK_HITS",
              label: "QUICK",
              icon: Zap,
              color: "text-truth-textLight",
              border: "border-truth-textLight",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as FeedTab)}
              className={`flex shrink-0 items-center gap-1.5 border-2 px-3 py-2 font-mono text-[8px] tracking-widest uppercase transition-all sm:gap-2 sm:px-5 sm:py-3 sm:text-[9px] ${
                activeTab === tab.id
                  ? `bg-card ${tab.color} ${tab.border} shadow-[2px_2px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_6px_rgba(255,255,255,0.05)]`
                  : "border-border text-muted hover:border-foreground hover:text-foreground bg-transparent"
              } `}
            >
              <tab.icon className="h-3 w-3" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-truth-accentRed bg-truth-accentRed/5 mb-8 flex items-center justify-between overflow-hidden border-2 p-4"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="text-truth-accentRed h-5 w-5 animate-pulse" />
              <div>
                <p className="text-truth-accentRed font-mono text-[10px] font-black tracking-widest uppercase">
                  SIGNAL_LOST // OFFLINE_PROTOCOL_ACTIVE
                </p>
                <p className="text-muted mt-0.5 font-mono text-[8px] uppercase">
                  Displaying cached signals from local node. New emissions
                  queued.
                </p>
              </div>
            </div>
            <div className="bg-truth-accentRed text-truth-bg animate-pulse px-2 py-0.5 font-mono text-[8px] font-black">
              LOCAL_MODE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StoriesBar
        stories={stories}
        onOpenComposer={() => setIsComposeOpen(true)}
      />

      <AnimatePresence>
        {pullProgress > 0 && (
          <motion.div
            style={{
              opacity: pullProgress / 100,
              scale: Math.min(pullProgress / 100, 1),
            }}
            className="mb-4 flex justify-center pt-2"
          >
            <div
              className={`rounded-full border-2 p-2 ${pullProgress >= 80 ? "border-truth-accentRed text-truth-accentRed" : "border-border text-muted"} animate-pulse`}
            >
              <RefreshCw className="h-4 w-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.6}
        onDrag={(e, info) => {
          if (info.offset.y > 0) {
            setPullProgress(Math.min(info.offset.y * 0.8, 120));
          }
        }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 80) {
            handleRefresh();
          } else {
            setPullProgress(0);
          }
        }}
        className="relative mb-20 min-h-[600px] space-y-8"
      >
        {isPending || isRefreshing ? (
          <FeedSkeleton />
        ) : displayedPosts.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-0"
          >
            <AnimatePresence mode="popLayout">
              {displayedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} priority={index < 2} />
              ))}
            </AnimatePresence>

            <div
              ref={observerTarget}
              className="flex h-20 items-center justify-center"
            >
              {isLoadingMore && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="text-truth-accentRed h-6 w-6 animate-spin" />
                  <span className="text-muted font-mono text-[8px] tracking-widest uppercase">
                    PULLING_NEXT_SIGNAL_POOL...
                  </span>
                </div>
              )}
              {!isLoadingMore && feeds[activeTab].hasMore && (
                <button
                  onClick={loadMore}
                  className="text-muted hover:text-foreground border-border bg-card/50 border border-dashed px-6 py-2 font-mono text-[9px] tracking-widest uppercase transition-colors"
                >
                  MANUAL_FETCH_OVERRIDE_ENABLED [LOAD_MORE]
                </button>
              )}
              {!feeds[activeTab].hasMore && (
                <div className="py-10 text-center opacity-30">
                  <div className="bg-border mx-auto mb-4 h-px w-24" />
                  <p className="text-muted font-mono text-[8px] tracking-[0.4em] uppercase">
                    END_OF_OBSERVABLE_STREAM
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="border-border bg-card/20 group border-4 border-dashed py-24 text-center">
            <div className="mb-4 flex justify-center">
              <Ghost className="text-muted/20 group-hover:text-truth-accentRed/40 h-12 w-12 transition-colors" />
            </div>
            <p className="text-muted font-mono text-[10px] leading-relaxed tracking-widest uppercase">
              {activeTab === "FOLLOWING"
                ? "No synchronized signals detected from observed nodes."
                : "The void remains silent. Be the first to emit a pulse."}
            </p>
          </div>
        )}
      </motion.div>

      <button
        onClick={() => setIsComposeOpen(true)}
        className="bg-truth-accentRed group fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.4)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 sm:right-8 sm:h-16 sm:w-16 lg:bottom-12 xl:right-92"
      >
        <Plus className="text-truth-bg h-8 w-8 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        user={user}
      />
    </>
  );
}
