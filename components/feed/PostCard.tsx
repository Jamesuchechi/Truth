"use client";

import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Ghost,
  ArrowUpRight,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Archive,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useRef } from "react";
import Logo from "@/components/shared/Logo";
import { ReportModal } from "@/components/moderation/ReportModal";
import { AppealModal } from "@/components/moderation/AppealModal";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import type { PostWithRelations } from "@/lib/types/post";
import ImageCarousel from "./ImageCarousel";
import PostAnalytics from "./PostAnalytics";
import { usePostTrack } from "@/hooks/usePostTrack";
import { updatePost, deletePost, archivePost } from "@/lib/actions/post";
import { getPostSummary } from "@/lib/actions/summary";
import { toggleReaction } from "@/lib/actions/reaction";
import { createComment } from "@/lib/actions/comment";
import { useTransition, useCallback } from "react";
import { ReactionPicker } from "./ReactionPicker";
import { useReactions } from "@/hooks/useReactions";
import type { ReactionType } from "@prisma/client";
import { Terminal, ScanFace } from "lucide-react";
import { ReactionBurst } from "./ReactionBurst";
import { fadeInUp, tapScale } from "@/lib/motion";

export function PostCard({
  post,
  isDetail = false,
  priority = false,
}: {
  post: PostWithRelations;
  isDetail?: boolean;
  priority?: boolean;
}) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLongPress = useCallback((e: React.PointerEvent) => {
    // Only for touch/mobile
    if (e.pointerType !== "touch") return;

    longPressTimer.current = setTimeout(() => {
      if ("vibrate" in navigator) navigator.vibrate(50);
      setIsMenuOpen(true);
    }, 500); // 500ms for long press
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);
  const isShadow = post.useShadowId;
  const isStory = post.visibilityType === "STORY";
  const hasMedia = post.media && post.media.length > 0;
  const isAuthor = session?.user?.id === post.authorId;

  // Management State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isPending, startTransition] = useTransition();

  // Optimistic Engagement State
  const [optimisticReactionOffset, setOptimisticReactionOffset] = useState(0);
  const [isReacted, setIsReacted] = useState(post.reactions?.length > 0);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(
    (post.reactions?.[0] as { type: ReactionType } | undefined)?.type || null
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { reactionCount: liveCount } = useReactions(post.id);
  const displayReactionCount =
    (liveCount ?? post.reactionCount) + optimisticReactionOffset;

  const [showBurst, setShowBurst] = useState(false);

  const [showComments, setShowComments] = useState(isDetail); // Default open in detail view
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentText, setCommentText] = useState("");

  // AI Summary State
  const [summary, setSummary] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (summary) return;
      setIsScanning(true);
      const res = await getPostSummary(post.id);
      if (res.summary) setSummary(res.summary);
      setIsScanning(false);
    },
    [post.id, summary]
  );

  // Tracking
  const { containerRef, trackClick, handleMouseEnter, handleMouseLeave } =
    usePostTrack({ postId: post.id });

  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const createdTime = new Date(post.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    const expiryTime = createdTime + fiveMinutes;

    const checkEditWindow = () => {
      const now = Date.now();
      if (now < expiryTime) {
        setCanEdit(true);
        const remainingTime = expiryTime - now;
        const timer = setTimeout(() => setCanEdit(false), remainingTime);
        return () => clearTimeout(timer);
      } else {
        setCanEdit(false);
      }
    };

    return checkEditWindow();
  }, [post.createdAt]);

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updatePost(post.id, editContent);
      if (res.success) setIsEditing(false);
      setIsMenuOpen(false);
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        "TERMINATE_SIGNAL: Are you sure? This action is permanent in the current reality."
      )
    ) {
      startTransition(async () => {
        await deletePost(post.id);
      });
    }
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archivePost(post.id);
      setIsMenuOpen(false);
    });
  };

  const maxChars = 280;
  const isLong = post.content.length > maxChars;
  const displayContent =
    !isDetail && isLong
      ? post.content.substring(0, maxChars) + "..."
      : post.content;

  return (
    <motion.div
      ref={containerRef}
      onClick={trackClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      {...tapScale}
      onPointerDown={handleLongPress}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      className={`group bg-card relative mb-4 border-2 p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-all duration-500 sm:mb-6 sm:p-6 sm:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] lg:p-8 dark:shadow-[4px_4px_0px_rgba(0,0,0,0.5)] dark:sm:shadow-[8px_8px_0px_rgba(0,0,0,0.5)] ${isStory ? "border-truth-accentPurple" : "border-border hover:border-truth-accentRed"} ${isDetail ? "" : "cursor-pointer"} `}
    >
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(false);
            }}
          >
            <motion.div
              className="bg-card border-truth-accentRed w-full max-w-xs border-2 p-2 shadow-[20px_20px_0px_rgba(0,0,0,0.4)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-border mb-2 border-b p-4">
                <p className="text-truth-accentRed font-mono text-[10px] leading-none font-black tracking-widest uppercase">
                  SIGNAL_INTERCEPTED
                </p>
                <p className="text-muted mt-1 font-mono text-[8px] uppercase">
                  Actions for node #{post.id.slice(-6)}
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/p/${post.id}`
                  );
                  showToast("SIGNAL_LINK_COPIED", "success");
                  setIsMenuOpen(false);
                }}
                className="hover:bg-truth-accentRed/5 group/item flex w-full items-center gap-3 p-4 text-left transition-colors"
              >
                <Copy className="text-truth-accentRed h-4 w-4" />
                <span className="font-mono text-[10px] font-bold uppercase">
                  Copy Universal Link
                </span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "TRUTH Signal",
                      text: post.content,
                      url: `${window.location.origin}/p/${post.id}`,
                    });
                  }
                  setIsMenuOpen(false);
                }}
                className="hover:bg-truth-accentRed/5 group/item flex w-full items-center gap-3 p-4 text-left transition-colors"
              >
                <Smartphone className="text-truth-accentRed h-4 w-4" />
                <span className="font-mono text-[10px] font-bold uppercase">
                  Transmit to External Node
                </span>
              </button>

              <div className="p-2 pt-4">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-truth-accentRed text-truth-bg w-full py-2 font-mono text-[9px] font-black tracking-widest uppercase"
                >
                  ABORT_INTERCEPT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header and other elements remain mostly the same, but we wrap content in Link if not detail */}
      {/* Thread Connection Line (Visual Hint) */}
      {post.parentId && (
        <div className="bg-truth-midGray/30 absolute -top-6 left-12 h-6 w-0.5" />
      )}

      {/* Dynamic Glow Effect */}
      <div
        className={`pointer-events-none absolute -inset-px bg-linear-to-r from-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${isStory ? "via-truth-accentPurple/5" : "via-truth-accentRed/5"} to-transparent`}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-start justify-between gap-2 sm:mb-6 lg:mb-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div
            className={`shrink-0 border-2 p-0.5 ${isShadow ? "border-truth-accentRed" : isStory ? "border-truth-accentPurple" : "border-border"}`}
          >
            <div className="bg-background relative flex h-8 w-8 items-center justify-center overflow-hidden sm:h-10 sm:w-10">
              {isShadow ? (
                <Ghost className="text-truth-accentRed h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <div className="bg-muted/20 h-full w-full" />
              )}
              {/* Glitch Overlay */}
              <div className="from-truth-accentRed animate-glitch pointer-events-none absolute inset-0 bg-linear-to-t to-transparent opacity-0 group-hover:opacity-10" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3
                className={`font-bitter truncate text-sm font-black tracking-tighter uppercase ${isShadow ? "text-truth-accentRed" : isStory ? "text-truth-accentPurple" : "text-foreground"}`}
              >
                {isShadow ? "SHADOW_IDENTITY" : post.author.username}
              </h3>
              {post.channel && (
                <Link
                  href={`/channels/${post.channel.slug}`}
                  className="group/chan flex shrink-0 items-center gap-1.5"
                >
                  <span className="text-muted group-hover/chan:text-foreground text-[10px] transition-colors">
                    IN
                  </span>
                  <span
                    className="bg-opacity-10 border-opacity-20 hover:bg-opacity-20 border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase transition-all"
                    style={{
                      color: post.channel.color || "#FF3366",
                      backgroundColor: `${post.channel.color || "#FF3366"}1a`,
                      borderColor: `${post.channel.color || "#FF3366"}33`,
                    }}
                  >
                    {post.channel.name}
                  </span>
                </Link>
              )}
              {isStory && (
                <span className="bg-truth-accentPurple text-truth-bg shrink-0 px-2 py-0.5 font-mono text-[8px] font-bold tracking-tighter uppercase">
                  STORY_MODE
                </span>
              )}
            </div>
            <div className="text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] tracking-widest uppercase sm:gap-x-3">
              <span className="flex items-center gap-1">
                {isShadow
                  ? `MASK_ID: ${post.author.shadowName || "ANONYMOUS"}`
                  : "AUTH_VERIFIED"}
                {isShadow && post.author.shadowVerified && (
                  <CheckCircle className="text-truth-accentPurple fill-truth-accentPurple/10 h-2.5 w-2.5" />
                )}
              </span>

              <span
                className={`border-opacity-30 flex shrink-0 items-center gap-1 border px-1.5 py-0.5 ${
                  post.author.reputationTier === "ARCHITECT"
                    ? "text-truth-accentYellow border-truth-accentYellow bg-truth-accentYellow/10"
                    : post.author.reputationTier === "GUARDIAN"
                      ? "text-truth-accentGreen border-truth-accentGreen bg-truth-accentGreen/10"
                      : post.author.reputationTier === "ORACLE"
                        ? "text-truth-accentBlue border-truth-accentBlue bg-truth-accentBlue/10"
                        : post.author.reputationTier === "SPECTRE"
                          ? "text-truth-accentPurple border-truth-accentPurple bg-truth-accentPurple/10"
                          : "text-truth-textGray border-truth-midGray bg-truth-darkGray/30"
                }`}
              >
                <Logo size={8} />
                {post.author.reputationTier}
              </span>

              <span className="shrink-0">
                {" // "} {formatRelativeTime(post.createdAt)}
              </span>
              {post.isRestored && (
                <span className="text-truth-accentGreen border-truth-accentGreen/30 bg-truth-accentGreen/5 flex animate-pulse items-center gap-1 border px-1.5 py-0.5 font-black">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  RESTORED_SIGNAL
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-muted hover:text-foreground p-2 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {/* Context Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="bg-truth-nearBlack border-truth-midGray absolute right-0 z-50 mt-2 w-52 max-w-[calc(100vw-2rem)] border-2 p-1 shadow-xl"
              >
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setShowAnalytics(true);
                        setIsMenuOpen(false);
                      }}
                      className="text-truth-textGray hover:text-truth-accentBlue hover:bg-truth-darkGray flex w-full items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-all"
                    >
                      <Logo size={16} />
                      VIEW_PULSE_ANALYTICS
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setIsMenuOpen(false);
                        }}
                        className="text-truth-textGray hover:text-truth-accentGreen hover:bg-truth-darkGray flex w-full items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-all"
                      >
                        <Edit3 className="h-4 w-4" />
                        EDIT_TRANSMISSION
                      </button>
                    )}
                    <button
                      onClick={handleArchive}
                      className="text-truth-textGray hover:text-truth-accentPurple hover:bg-truth-darkGray flex w-full items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-all"
                    >
                      <Archive className="h-4 w-4" />
                      ARCHIVE_SIGNAL
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-truth-accentRed hover:bg-truth-accentRed/10 border-truth-midGray/30 flex w-full items-center gap-3 border-t px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      TERMINATE_POST
                    </button>
                  </>
                )}
                {!isAuthor && (
                  <button
                    onClick={() => {
                      setIsReportModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-truth-textGray hover:text-truth-accentRed hover:bg-truth-darkGray flex w-full items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-all"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    REPORT_SIGNAL
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 mb-4 space-y-4 sm:mb-6 lg:mb-8">
        {post.isFiltered && !isAuthor ? (
          <div className="bg-truth-accentRed/5 border-truth-accentRed/20 flex flex-col items-center gap-4 border-2 border-dashed py-12">
            <ShieldAlert className="text-truth-accentRed h-12 w-12 opacity-20" />
            <p className="text-muted font-mono text-[10px] tracking-widest uppercase">
              Signal terminated by autonomous protocol.
            </p>
          </div>
        ) : post.isFiltered && isAuthor ? (
          <div className="bg-truth-accentRed/10 border-truth-accentRed space-y-4 border-2 p-6">
            <div className="text-truth-accentRed flex items-center gap-3 font-mono text-[10px] font-black uppercase">
              <AlertTriangle className="h-4 w-4" /> TRANSMISSION_FILTERED
            </div>
            <p className="font-bitter text-foreground text-sm leading-relaxed">
              Your signal has been quarantined by the AI moderation layer. No
              other nodes can observe this content.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAppealModalOpen(true);
              }}
              className="bg-truth-accentRed w-full py-3 font-mono text-[9px] font-black tracking-widest text-white uppercase transition-all hover:brightness-110"
            >
              FILE_PROTOCOL_APPEAL
            </button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="border-truth-accentBlue font-bitter text-foreground selection:bg-truth-accentBlue/30 min-h-[150px] w-full border-2 bg-black p-4 focus:outline-none"
              placeholder="UPDATE_TRUTH_DATA..."
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsEditing(false)}
                className="text-muted hover:text-foreground font-mono text-[10px] tracking-widest uppercase"
              >
                ABORT_UPDATE
              </button>
              <button
                disabled={isPending}
                onClick={handleUpdate}
                className="bg-truth-accentBlue text-truth-nearBlack hover:bg-truth-textLight px-4 py-1.5 font-mono text-[10px] font-black tracking-widest uppercase disabled:opacity-50"
              >
                {isPending ? "SYNCING..." : "COMMIT_CHANGES"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={isDetail ? "" : "group/content relative block"}>
              <div
                className={`font-bitter ${isDetail ? "text-lg sm:text-2xl" : "text-sm sm:text-base lg:text-lg"} text-foreground prose prose-invert overflow-wrap-anywhere selection:bg-truth-accentRed selection:text-truth-bg max-w-none leading-relaxed break-words`}
              >
                <ReactMarkdown>{displayContent}</ReactMarkdown>
              </div>
              {!isDetail && isLong && (
                <div className="relative z-10 mt-2 flex items-center gap-4">
                  <Link
                    href={`/p/${post.id}`}
                    className="text-truth-accentRed font-mono text-[10px] font-black uppercase transition-transform group-hover/content:translate-x-1"
                  >
                    READ_FULL_SIGNAL {" >>"}
                  </Link>
                  {!summary && (
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="text-truth-accentBlue hover:text-foreground border-truth-accentBlue/30 bg-truth-accentBlue/5 pointer-events-auto flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase transition-all disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <div className="border-truth-accentBlue h-2 w-2 animate-spin border border-t-transparent" />
                          SCANNING...
                        </>
                      ) : (
                        <>
                          <ScanFace className="h-3 w-3" />
                          SCAN_SIGNAL
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              {!isDetail && (
                <Link
                  href={`/p/${post.id}`}
                  className="absolute inset-0 z-0"
                  aria-label="View post detail"
                />
              )}
            </div>
          </div>
        )}

        {/* AI Summary Display */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-truth-accentBlue/5 border-truth-accentBlue relative overflow-hidden border-l-2 p-4"
            >
              {/* Scanline Animation */}
              <div className="via-truth-accentBlue/10 animate-scanline pointer-events-none absolute inset-0 h-4 bg-linear-to-b from-transparent to-transparent" />
              <div className="relative z-10 flex items-start gap-3">
                <Terminal className="text-truth-accentBlue mt-1 h-4 w-4 shrink-0" />
                <p className="text-truth-accentBlue font-mono text-[11px] leading-relaxed tracking-tight uppercase">
                  <span className="opacity-50">[DECRYPTED_SIGNAL]: </span>
                  {summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasMedia && (
          <div className="my-4">
            <ImageCarousel media={post.media} priority={priority} />
          </div>
        )}
      </div>

      {/* Thread/Story Indicators */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row lg:mb-8">
        {post.visibilityType === "LIMITED" && (
          <div className="bg-truth-accentBlue/5 border-truth-accentBlue group/scarcity relative flex flex-1 flex-col gap-1 overflow-hidden border-l-4 p-3">
            <div className="flex items-center gap-3">
              <Logo size={16} className="animate-pulse" />
              <span className="text-truth-accentBlue font-mono text-[10px] font-black tracking-widest uppercase">
                LIMITED_BY_OBSERVATION: {post.viewsLimit}_TOTAL
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted font-mono text-[8px] tracking-widest uppercase">
                YOU_ARE_1_OF_{post.viewsLimit}_AUTHORIZED_OBSERVERS
              </span>
              <span className="text-truth-accentBlue font-mono text-[9px] font-black">
                {Math.max(0, (post.viewsLimit || 0) - post.currentViews)}
                _REMAINING
              </span>
            </div>
            <div className="bg-truth-accentBlue/20 absolute bottom-0 left-0 h-[2px] w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (post.currentViews / (post.viewsLimit || 1)) * 100)}%`,
                }}
                className="bg-truth-accentBlue h-full shadow-[0_0_10px_#00E5FF]"
              />
            </div>
          </div>
        )}

        {isStory && (
          <div className="bg-truth-accentPurple/5 border-truth-accentPurple flex flex-1 items-center gap-3 border-l-4 p-3">
            <Clock className="text-truth-accentPurple h-4 w-4 animate-pulse" />
            <span className="text-truth-accentPurple font-mono text-[10px] tracking-widest uppercase">
              TTL: 24_HOURS_REMAINING
            </span>
          </div>
        )}

        {post.parentId && (
          <div className="bg-truth-accentBlue/5 border-truth-accentBlue flex flex-1 items-center gap-3 border-l-4 p-3">
            <Layers className="text-truth-accentBlue h-4 w-4" />
            <span className="text-truth-accentBlue font-mono text-[10px] tracking-widest uppercase">
              PART_OF_SEQUENTIAL_THREAD
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-truth-midGray relative z-10 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t pt-4 sm:pt-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative">
            <button
              disabled={isPending}
              onMouseEnter={() => setIsPickerOpen(true)}
              onClick={(e) => {
                e.stopPropagation();
                // Default toggle (REAL_TALK as primary for fast interaction)
                const type: ReactionType = "REAL_TALK";
                const wasReacted = isReacted;
                const wasType = activeReaction;

                // Optimistic Update
                if (wasReacted && wasType === type) {
                  setOptimisticReactionOffset((prev) => prev - 1);
                  setIsReacted(false);
                  setActiveReaction(null);
                } else if (!wasReacted) {
                  setOptimisticReactionOffset((prev) => prev + 1);
                  setIsReacted(true);
                  setActiveReaction(type);
                  setShowBurst(true);
                  setTimeout(() => setShowBurst(false), 1000);
                } else {
                  // Just changing type
                  setActiveReaction(type);
                  setShowBurst(true);
                  setTimeout(() => setShowBurst(false), 1000);
                }

                startTransition(async () => {
                  const res = await toggleReaction(post.id, type);
                  if (res.error) {
                    setOptimisticReactionOffset(0);
                    setIsReacted(wasReacted);
                    setActiveReaction(wasType);
                  } else {
                    setOptimisticReactionOffset(0); // Reset after sync
                  }
                });
              }}
              className={`group/btn flex items-center gap-2 transition-all ${isReacted ? "text-truth-accentRed" : "text-truth-textGray"} ${isStory ? "hover:text-truth-accentPurple" : "hover:text-truth-accentRed"}`}
            >
              <div
                className={`relative border border-transparent p-2 transition-all ${isReacted ? "border-truth-accentRed/30 bg-truth-accentRed/5" : ""} ${isStory ? "group-hover/btn:border-truth-accentPurple" : "group-hover/btn:border-truth-accentRed"}`}
              >
                {/* Micro-burst Animation */}
                <AnimatePresence>
                  {showBurst && (
                    <ReactionBurst
                      key={activeReaction}
                      color={
                        activeReaction === "STAY_STRONG"
                          ? "#F97316"
                          : activeReaction === "REAL_TALK"
                            ? "#EF4444"
                            : "#FF3366"
                      }
                    />
                  )}
                </AnimatePresence>

                {isReacted && activeReaction ? (
                  <span className="text-sm drop-shadow-md">
                    {activeReaction === "RELATE" && "🫂"}
                    {activeReaction === "DEEP" && "🌊"}
                    {activeReaction === "NOT_ALONE" && "💙"}
                    {activeReaction === "WILD" && "🤯"}
                    {activeReaction === "REAL_TALK" && "🔥"}
                    {activeReaction === "THANK_YOU" && "🙏"}
                    {activeReaction === "THAT_HURTS" && "😢"}
                    {activeReaction === "STAY_STRONG" && "💪"}
                  </span>
                ) : (
                  <Heart
                    className={`h-4 w-4 ${isReacted ? "fill-truth-accentRed text-truth-accentRed" : ""}`}
                  />
                )}
              </div>
              {(isAuthor || isReacted) && (
                <motion.span
                  key={displayReactionCount}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bitter text-[10px] font-black tracking-tighter uppercase"
                >
                  {displayReactionCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {isPickerOpen && (
                <ReactionPicker
                  activeType={activeReaction}
                  onClose={() => setIsPickerOpen(false)}
                  onSelect={(type) => {
                    const wasReacted = isReacted;
                    const wasType = activeReaction;

                    // Optimistic
                    if (wasReacted && wasType === type) {
                      setOptimisticReactionOffset((prev) => prev - 1);
                      setIsReacted(false);
                      setActiveReaction(null);
                    } else if (!wasReacted) {
                      setOptimisticReactionOffset((prev) => prev + 1);
                      setIsReacted(true);
                      setActiveReaction(type);
                      setShowBurst(true);
                      setTimeout(() => setShowBurst(false), 600);
                    } else {
                      setActiveReaction(type);
                      setShowBurst(true);
                      setTimeout(() => setShowBurst(false), 600);
                    }

                    setIsPickerOpen(false);
                    startTransition(async () => {
                      const res = await toggleReaction(post.id, type);
                      if (res.error) {
                        setOptimisticReactionOffset(0);
                        setIsReacted(wasReacted);
                        setActiveReaction(wasType);
                      } else {
                        setOptimisticReactionOffset(0); // Reset after sync
                      }
                    });
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isDetail) return; // Always open in detail
              setShowComments(!showComments);
            }}
            className={`group/btn flex items-center gap-2 transition-all ${showComments ? "text-truth-accentBlue" : "text-truth-textGray"} hover:text-truth-accentBlue`}
          >
            <div
              className={`border border-transparent p-2 transition-all ${showComments ? "border-truth-accentBlue/30 bg-truth-accentBlue/5" : ""} group-hover/btn:border-truth-accentBlue`}
            >
              <MessageCircle className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase">
              {commentCount}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsReportModalOpen(true);
            }}
            className="text-muted hover:text-truth-accentRed group/btn flex items-center gap-2 transition-all"
            title="Report Signal Violation"
          >
            <div className="group-hover/btn:border-truth-accentRed border border-transparent p-2 transition-all">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </button>
        </div>

        <button className="text-muted hover:text-foreground group/view flex shrink-0 items-center gap-1 font-mono text-[9px] whitespace-nowrap transition-colors sm:text-[10px]">
          VIEW_DECRYPTION
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Comment Trace Input - Always visible in detail view */}
      <AnimatePresence>
        {(showComments || isDetail) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-truth-midGray/50 mt-4 overflow-hidden border-t pt-4"
          >
            <form
              action={async (formData) => {
                const text = formData.get("content") as string;
                if (!text.trim()) return;

                setCommentCount((prev) => prev + 1);
                setCommentText("");

                startTransition(async () => {
                  const res = await createComment(formData);
                  if (res.error) {
                    setCommentCount((prev) => prev - 1);
                    setCommentText(text);
                  }
                });
              }}
              className="flex flex-wrap items-center gap-2 sm:flex-nowrap"
            >
              <input type="hidden" name="postId" value={post.id} />
              <input
                type="text"
                name="content"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Synchronize comment signal..."
                className="bg-truth-nearBlack border-truth-midGray text-foreground placeholder:text-muted/40 focus:border-truth-accentBlue min-w-0 flex-1 border px-3 py-2 font-mono text-[10px] transition-colors focus:outline-none"
                disabled={isPending}
              />
              <button
                type="submit"
                disabled={isPending || !commentText.trim()}
                className="bg-truth-accentBlue/20 border-truth-accentBlue text-truth-accentBlue hover:bg-truth-accentBlue hover:text-truth-bg border px-4 py-2 font-mono text-[9px] font-bold uppercase transition-all disabled:opacity-30"
              >
                EMIT
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute top-0 right-0 h-8 w-8 overflow-hidden">
        <div
          className={`absolute top-0 right-0 h-[200%] w-[200%] translate-x-1/2 -translate-y-1/2 rotate-45 ${isStory ? "bg-truth-accentPurple/20" : "bg-border/50"}`}
        />
      </div>

      <AnimatePresence>
        {showAnalytics && (
          <PostAnalytics post={post} onClose={() => setShowAnalytics(false)} />
        )}
      </AnimatePresence>

      {isPending && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <Logo size={32} className="animate-pulse" />
        </div>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={post.id}
        type="POST"
      />

      <AppealModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        reportId={post.reports?.[0]?.id || ""}
      />
    </motion.div>
  );
}
