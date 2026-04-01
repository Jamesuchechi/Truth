"use client"

import { useEffect, useState } from "react"
import { getComments } from "@/lib/actions/comment"
import CommentItem from "./CommentItem"
import { Zap } from "lucide-react"
import type { CommentWithAuthor } from "@/lib/types/comment"

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments(postId)
      setComments(data as CommentWithAuthor[])
      setIsLoading(false)
    }
    fetchComments()
  }, [postId])

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Zap className="w-6 h-6 text-truth-accentBlue animate-pulse" />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest italic font-medium">
          NO_SIGNAL_TRACES_DETECTED_IN_THIS_COORD
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-truth-midGray/10 animate-in fade-in duration-700">
      <div className="px-4 py-3 bg-truth-nearBlack/20 border-b border-truth-midGray/10">
        <h3 className="font-mono text-[9px] font-black uppercase tracking-widest text-truth-textGray">
          {comments.length} SIGNAL_TRACES_LOGGED
        </h3>
      </div>
      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
