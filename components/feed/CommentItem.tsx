"use client"

import { formatRelativeTime } from "@/lib/utils"
import { Ghost } from "lucide-react"
import type { CommentWithAuthor } from "@/lib/types/comment"

export default function CommentItem({ 
  comment 
}: { 
  comment: CommentWithAuthor
}) {
  return (
    <div className="flex gap-4 p-4 border-b border-truth-midGray/10 hover:bg-truth-nearBlack/30 transition-all group">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-8 h-8 border border-truth-midGray bg-truth-darkGray flex items-center justify-center relative overflow-hidden">
          {comment.author.shadowName ? (
            <Ghost className="w-4 h-4 text-truth-accentRed" />
          ) : (
            <div className="w-full h-full bg-truth-midGray" />
          )}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_2px]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] font-black uppercase tracking-tighter text-truth-textLight">
            {comment.author.username}
          </span>
          <span className="font-mono text-[8px] text-truth-textGray uppercase">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="font-bitter text-sm text-truth-textGray group-hover:text-truth-textLight transition-colors leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  )
}
