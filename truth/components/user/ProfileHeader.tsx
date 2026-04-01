// components/user/ProfileHeader.tsx
import { Shield,Calendar, Users, Hash, Zap } from "lucide-react"
import Image from "next/image"

interface ProfileHeaderProps {
  user: {
    username: string | null
    shadowName: string | null
    isAnonymous: boolean
    image: string | null
    bio: string | null
    createdAt: Date
    _count: {
      posts: number
      followers: number
      following: number
    }
  }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const displayName = user.isAnonymous ? user.shadowName : user.username
  const secondaryName = user.isAnonymous ? `@${user.username}` : user.shadowName

  return (
    <div className="w-full bg-truth-nearBlack border-2 border-truth-midGray p-1 bg-[url('/grid.svg')] bg-fixed">
      {/* Banner Area (Stylized) */}
      <div className="h-48 w-full bg-gradient-to-br from-truth-darkGray to-truth-bg relative overflow-hidden border-b-2 border-truth-midGray">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-truth-accentRed via-transparent to-transparent animate-pulse" />
        <div className="absolute top-4 right-4 flex gap-2">
            {user.isAnonymous && (
                <div className="px-3 py-1 bg-truth-accentRed/20 border border-truth-accentRed text-truth-accentRed font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Anonymous Mode Active
                </div>
            )}
            <div className="px-3 py-1 bg-truth-bg/80 border border-truth-midGray text-truth-textGray font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Hash className="w-3 h-3" />
                ID: {user.shadowName?.split('_')[1] || 'VOID'}
            </div>
        </div>
      </div>

      {/* Profile Info Area */}
      <div className="px-8 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row gap-8 items-end">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-40 h-40 bg-truth-bg border-4 border-truth-midGray shadow-[8px_8px_0px_#FF3366] overflow-hidden relative">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={displayName || "User"} 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-truth-darkGray">
                <Zap className="w-16 h-16 text-truth-midGray group-hover:text-truth-accentRed transition-colors" />
              </div>
            )}
            {/* Glitch Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-gradient-to-t from-truth-accentRed to-transparent animate-glitch" />
          </div>
        </div>

        {/* Text Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="font-bitter text-5xl font-black text-truth-textLight uppercase tracking-tighter flex items-center gap-4">
              {displayName}
              {user.isAnonymous && <span className="text-truth-accentRed italic text-2xl font-mono opacity-50">[SHADOW]</span>}
            </h1>
            <p className="font-mono text-lg text-truth-accentRed flex items-center gap-2">
              <span className="opacity-50 text-truth-textGray">{secondaryName}</span>
            </p>
          </div>

          {user.bio && (
            <p className="max-w-2xl font-mono text-sm text-truth-textGray leading-relaxed bg-truth-bg/50 p-4 border-l-2 border-truth-midGray">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-truth-textGray pt-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-truth-accentRed" />
              <span className="text-truth-textLight font-bold">{user._count.followers}</span> Followers
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-truth-accentRed" />
              <span className="text-truth-textLight font-bold">{user._count.following}</span> Following
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-truth-accentRed" />
              <span className="text-truth-textLight font-bold">{user._count.posts}</span> Transmissions
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-truth-midGray" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 self-center md:self-end pt-4">
            <button className="px-6 py-3 bg-truth-accentRed text-truth-bg font-mono font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                Connect
            </button>
            <button className="px-6 py-3 bg-truth-bg border-2 border-truth-midGray text-truth-textLight font-mono font-bold text-xs uppercase tracking-widest hover:border-truth-accentRed transition-all">
                Message
            </button>
        </div>
      </div>
    </div>
  )
}
