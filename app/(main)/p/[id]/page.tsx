import { getPostById } from "@/lib/actions/post"
import { notFound } from "next/navigation"
import { PostCard } from "@/components/feed/PostCard"
import CommentList from "@/components/feed/CommentList"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { PostWithRelations } from "@/lib/types/post"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://truth-so4f.vercel.app'

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    return {
      title: 'Signal Not Found | TRUTH',
      description: 'This signal does not exist in the current protocol layer.',
    }
  }

  const isShadow = post.useShadowId
  const author = isShadow ? 'SHADOW_IDENTITY' : post.author.username
  const rawContent = post.content.replace(/[#*_~`>\[\]()]/g, '').trim()
  const excerpt = rawContent.length > 160 ? rawContent.substring(0, 157) + '...' : rawContent
  const ogUrl = `${BASE_URL}/api/og?type=post&id=${id}&author=${encodeURIComponent(author)}`
  const canonicalUrl = `${BASE_URL}/p/${id}`

  return {
    title: `${author} on TRUTH | Signal_${id.slice(0, 8).toUpperCase()}`,
    description: excerpt || 'A signal emitted on the TRUTH protocol.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author} emitted a signal on TRUTH`,
      description: excerpt || 'Read the full transmission.',
      url: canonicalUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `Signal by ${author}` }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${author} on TRUTH`,
      description: excerpt || 'Radical honesty. Anonymous connection.',
      images: [ogUrl],
    },
  }
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
