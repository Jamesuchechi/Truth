// components/profile/UserList.tsx
import Link from "next/link"
import FollowButton from "./FollowButton"
import { auth } from "@/auth"
import { getFollowStatus } from "@/lib/actions/follow"

interface UserListProps {
  users: {
    id: string
    username: string
    shadowName: string | null
    image: string | null
    reputationTier: string
  }[]
  title: string
}

export default async function UserList({ users, title }: UserListProps) {
  const session = await auth()

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-8 bg-truth-accentBlue" />
        <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase tracking-tight">
          {title} <span className="text-truth-accentBlue">[{users.length}]</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.length > 0 ? (
          users.map(async (user) => {
            const isOwnProfile = session?.user?.id === user.id
            const { isFollowing, isMutual } = await getFollowStatus(user.id)
            
            return (
              <div 
                key={user.id} 
                className="p-6 bg-truth-nearBlack border-2 border-truth-midGray/20 hover:border-truth-accentBlue/40 transition-all group flex items-center justify-between"
              >
                <Link href={`/${user.username}`} className="flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-truth-midGray/30 group-hover:border-truth-accentBlue/30 flex items-center justify-center font-bitter text-lg font-black text-truth-accentBlue bg-truth-bg">
                    {user.shadowName ? "S" : "U"}
                  </div>
                  <div>
                    <h3 className="font-bitter font-black text-truth-textLight uppercase group-hover:text-truth-accentBlue transition-colors">
                      {user.shadowName || user.username}
                    </h3>
                    <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest mt-0.5">
                      Level: {user.reputationTier}
                    </p>
                  </div>
                </Link>

                {!isOwnProfile && (
                  <div className="scale-75 origin-right">
                    <FollowButton 
                      targetId={user.id} 
                      initialIsFollowing={isFollowing} 
                      isMutual={isMutual}
                    />
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="md:col-span-2 py-24 text-center border-4 border-dashed border-truth-midGray/10 bg-truth-nearBlack/20">
             <p className="font-mono text-[10px] text-truth-textGray uppercase tracking-widest leading-loose">
               No signals detected in this sector.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
