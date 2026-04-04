import { getUserByUsername } from "@/lib/actions/user"
import { getFollowStatus } from "@/lib/actions/follow"
import ProfileHeader from "@/components/profile/ProfileHeader"
import MessagingForm from "@/components/profile/MessagingForm"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Inbox } from "lucide-react"
import NftManifesto from "@/components/profile/NftManifesto"
import type { NftStatus } from "@prisma/client"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://truth-so4f.vercel.app'

interface Props {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user) {
    return {
      title: 'Node Not Found | TRUTH',
      description: 'This identity node does not exist in the TRUTH protocol.',
    }
  }

  const canonicalUrl = `${BASE_URL}/${username}`
  const ogUrl = `${BASE_URL}/api/og?type=profile&username=${encodeURIComponent(username)}&tier=${encodeURIComponent(user.reputationTier || 'SIGNAL')}`

  return {
    title: `${username} | TRUTH Signal Protocol`,
    description: user.bio
      ? user.bio.substring(0, 160)
      : `${username} is emitting signals on TRUTH — the radical honesty social protocol.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${username} on TRUTH`,
      description: user.bio || 'Radical honesty. Anonymous connection.',
      url: canonicalUrl,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${username}'s TRUTH profile` }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username} on TRUTH`,
      description: user.bio || 'Radical honesty. Anonymous connection.',
      images: [ogUrl],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const user = await getUserByUsername(username)
  const session = await auth()

  if (!user) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === user.id
  const { isFollowing, isMutual } = await getFollowStatus(user.id)

  return (
    <main className="min-h-screen bg-truth-bg text-truth-textLight pt-20">
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-fadeIn">
        <ProfileHeader 
          user={user} 
          isFollowing={isFollowing}
          isMutual={isMutual}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
               <div className="w-2 h-8 bg-truth-accentRed" /> Recent Transmissions
             </h2>
             <div className="p-20 border-2 border-dashed border-truth-midGray text-center rounded-lg bg-truth-nearBlack/20">
               <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.3em] font-bold">Awaiting Signal Synchronization // Protocol V4</p>
             </div>
          </div>
          
          <div className="space-y-12">
            {!isOwnProfile ? (
              <section className="space-y-6">
                <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-truth-accentBlue" /> Send_Signal
                </h2>
                <MessagingForm receiverId={user.id} receiverName={user.username} />
              </section>
            ) : (
              <section className="space-y-6">
                <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-truth-accentGreen" /> Your_Terminal
                </h2>
                <Link href="/inbox" className="group block p-8 bg-truth-nearBlack border-2 border-truth-midGray hover:border-truth-accentGreen transition-all shadow-[12px_12px_0px_rgba(50,205,50,0.1)]">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen">
                       <Inbox className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="font-bitter font-black text-lg text-truth-textLight group-hover:text-truth-accentGreen transition-colors">ACCESS INBOX</h3>
                       <p className="font-mono text-[8px] text-truth-textGray uppercase">Decrypting Comms...</p>
                     </div>
                   </div>
                   <p className="font-mono text-[10px] text-truth-textGray/60 italic">Review incoming anonymous signals and synchronized truths.</p>
                </Link>
              </section>
            )}

            <NftManifesto 
              user={{
                id: user.id,
                shadowName: user.shadowName,
                nftStatus: user.nftStatus as NftStatus,
                nftTokenId: user.nftTokenId,
                nftContractAddress: user.nftContractAddress,
                nftMintedAt: user.nftMintedAt,
                reputationScore: user.reputationScore
              }} 
              isOwnProfile={isOwnProfile} 
            />

            <section className="space-y-6">
              <h2 className="font-bitter text-2xl font-black text-truth-textLight uppercase tracking-tight flex items-center gap-3">
                <div className="w-1.5 h-6 bg-truth-midGray" /> Identity_Data
              </h2>
              <div className="p-8 bg-truth-nearBlack border-2 border-truth-midGray">
                <h3 className="font-mono text-[10px] uppercase font-bold text-truth-textGray mb-4">Signal Metadata</h3>
                <ul className="space-y-4 font-mono text-xs text-truth-textLight/70">
                  <li className="flex justify-between border-b border-truth-midGray pb-2">
                    <span>Network Status</span>
                    <span className="text-truth-accentGreen font-bold">Active</span>
                  </li>
                  <li className="flex justify-between border-b border-truth-midGray pb-2">
                    <span>Account Tier</span>
                    <span className="text-truth-textGray uppercase">{user.isAnonymous ? "Shadow" : "Verified"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Origin Point</span>
                    <span className="text-truth-textGray">Earth Node-7</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
