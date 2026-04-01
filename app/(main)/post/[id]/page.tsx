import { getPostById } from "@/lib/actions/post"
import { notFound } from "next/navigation"
import { PostCard } from "@/components/feed/PostCard"
import CommentList from "@/components/feed/CommentList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { PostWithRelations } from "@/lib/types/post"

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Back Button */}
      <Link 
        href="/feed" 
        className="group flex items-center gap-3 mb-8 w-fit"
      >
        <div className="p-2 border border-truth-midGray group-hover:border-truth-accentRed group-hover:bg-truth-accentRed/10 transition-all rounded-sm">
          <ArrowLeft className="w-5 h-5 text-truth-textGray group-hover:text-truth-accentRed transition-colors" />
        </div>
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-truth-textGray group-hover:text-truth-accentRed transition-colors">
          RETURN_TO_PULSE_FEED
        </span>
      </Link>

      {/* Main Post Card */}
      <PostCard post={post as PostWithRelations} isDetail={true} />

      {/* Comment Section */}
      <div className="mt-12 bg-truth-nearBlack/40 border border-truth-midGray/10 overflow-hidden rounded-sm">
        <CommentList postId={post.id} />
      </div>
    </div>
  )
}
