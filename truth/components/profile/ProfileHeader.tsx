"use client"

import { Shield, Calendar, Hash, Zap } from "lucide-react"
import Image from "next/image"

interface ProfileHeaderProps {
  user: {
    username: string
    image?: string | null
    bio?: string | null
    isAnonymous?: boolean
    shadowName?: string | null
    createdAt: Date
    _count: {
      posts: number
      followers: number
      following: number
    }
  }
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="w-full bg-truth-nearBlack border-2 border-truth-midGray p-10 shadow-[20px_20px_0px_rgba(255,51,102,0.1)] relative overflow-hidden group">
      {/* Decorative Background Element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-truth-accentRed/5 rounded-full blur-3xl group-hover:bg-truth-accentRed/10 transition-all duration-1000" />
      
      <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
        <div className="relative group/avatar">
          <div className="w-32 h-32 bg-truth-bg border-4 border-truth-midGray flex items-center justify-center overflow-hidden relative shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
            {user.image ? (
              <Image 
                src={user.image} 
                alt={user.username} 
                fill 
                className="object-cover" 
                priority
              />
            ) : (
              <div className="text-truth-accentRed font-bitter text-5xl font-black">{user.username[0].toUpperCase()}</div>
            )}
          </div>
          {user.isAnonymous && (
            <div className="absolute -bottom-2 -right-2 bg-truth-accentRed p-2 shadow-lg" title="Shadow Identity Active">
              <Zap className="w-4 h-4 text-truth-bg" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-bitter text-5xl font-black text-truth-textLight uppercase tracking-tighter">
              {user.username}
            </h1>
            {!user.isAnonymous && (
              <div className="flex items-center gap-1 px-3 py-1 bg-truth-accentGreen/10 border border-truth-accentGreen text-truth-accentGreen font-mono text-[10px] uppercase tracking-widest">
                <Shield className="w-3 h-3" /> External Verified
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-truth-textGray">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-truth-accentRed" />
              Manifested: {joinDate}
            </div>
            {user.shadowName && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-truth-accentRed" />
                Shadow: {user.shadowName}
              </div>
            )}
          </div>

          {user.bio ? (
            <p className="max-w-2xl font-mono text-sm text-truth-textLight/80 leading-relaxed border-l-2 border-truth-midGray pl-6 italic">
              &quot;{user.bio}&quot;
            </p>
          ) : (
            <p className="font-mono text-xs text-truth-textGray italic">No designation transmitted yet...</p>
          )}

          <div className="flex gap-8 pt-4">
            <div className="text-center group/stat cursor-pointer">
              <div className="font-bitter text-2xl font-black text-truth-textLight group-hover:text-truth-accentRed transition-colors">{user._count.posts}</div>
              <div className="font-mono text-[8px] uppercase tracking-widest text-truth-textGray">Transmissions</div>
            </div>
            <div className="text-center group/stat cursor-pointer">
              <div className="font-bitter text-2xl font-black text-truth-textLight group-hover:text-truth-accentRed transition-colors">{user._count.followers}</div>
              <div className="font-mono text-[8px] uppercase tracking-widest text-truth-textGray">Signals (Followers)</div>
            </div>
            <div className="text-center group/stat cursor-pointer">
              <div className="font-bitter text-2xl font-black text-truth-textLight group-hover:text-truth-accentRed transition-colors">{user._count.following}</div>
              <div className="font-mono text-[8px] uppercase tracking-widest text-truth-textGray">Observing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
