"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Home, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Hash, 
  Shield, 
  Zap, 
  User
} from "lucide-react"
import { motion } from "framer-motion"
import { logoutUser } from "@/lib/actions/user"
import { useTransition } from "react"

const navItems = [
  { href: "/feed", icon: Home, label: "Feed", description: "The Pulse" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox", description: "Internal Comms" },
  { href: "/channels", icon: Hash, label: "Channels", description: "Frequency Filters" },
  { href: "/settings", icon: Settings, label: "Settings", description: "Protocol Config" },
]

export default function Sidebar({ user }: { user: { id: string; username?: string | null; image?: string | null; shadowName?: string | null } }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser()
    })
  }

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-truth-nearBlack border-r-2 border-truth-midGray flex flex-col z-50">
      {/* Branding */}
      <div className="p-8 border-b-2 border-truth-midGray relative group overflow-hidden">
         <motion.div 
           initial={{ x: -20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="relative z-10 flex items-center gap-3"
         >
           <div className="w-10 h-10 bg-truth-accentRed flex items-center justify-center rounded-sm">
             <Shield className="text-truth-bg w-6 h-6" />
           </div>
           <div>
             <h1 className="font-bitter text-2xl font-black text-truth-textLight tracking-tighter uppercase leading-none">
               TRUTH<span className="text-truth-accentRed">OS</span>
             </h1>
             <p className="font-mono text-[8px] text-truth-textGray uppercase tracking-[0.2em] mt-1">
               Identity Protocol v4.0.2
             </p>
           </div>
         </motion.div>
         {/* Background Scanline effect overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,300%_100%] z-0 opacity-20 pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div className={`
                relative p-4 flex items-center gap-4 border-2 transition-all duration-300
                ${isActive 
                  ? "bg-truth-accentRed/10 border-truth-accentRed text-truth-accentLight shadow-[4px_4px_0px_rgba(255,51,102,0.2)]" 
                  : "bg-transparent border-transparent text-truth-textGray hover:border-truth-midGray hover:text-truth-textLight"}
              `}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-truth-accentRed" : "group-hover:text-truth-accentRed"}`} />
                <div className="flex flex-col">
                  <span className="font-bitter font-bold text-sm uppercase tracking-wide">{item.label}</span>
                  <span className="font-mono text-[8px] uppercase opacity-50">{item.description}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute -left-1 w-1 h-3/4 bg-truth-accentRed"
                  />
                )}
              </div>
            </Link>
          )
        })}

        <div className="pt-8 px-4">
           <div className="h-px bg-truth-midGray w-full mb-8" />
           <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest mb-4 flex items-center gap-2">
             <Zap className="w-3 h-3 text-truth-accentRed" /> Network Status
           </p>
           <div className="space-y-3">
             <div className="flex items-center justify-between text-[8px] font-mono uppercase">
               <span className="text-truth-textGray">Encryption Level</span>
               <span className="text-truth-accentGreen">AES-256</span>
             </div>
             <div className="flex items-center justify-between text-[8px] font-mono uppercase">
               <span className="text-truth-textGray">Protocol Lag</span>
               <span className="text-truth-accentRed">12ms</span>
             </div>
           </div>
        </div>
      </nav>

      {/* User Card */}
      <div className="p-4 mt-auto border-t-2 border-truth-midGray bg-truth-nearBlack">
        <div className="p-4 bg-truth-darkGray border border-truth-midGray rounded-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-truth-accentRed p-0.5">
               <div className="relative w-full h-full bg-truth-midGray flex items-center justify-center overflow-hidden">
                 {user?.image ? (
                   <Image 
                     src={user.image} 
                     alt={user.username || "Agent Avatar"} 
                     fill 
                     className="object-cover"
                     sizes="40px"
                   />
                 ) : (
                   <User className="w-5 h-5 text-truth-textGray" />
                 )}
               </div>
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bitter font-black text-xs text-truth-textLight truncate uppercase">{user?.username || "Agent Null"}</h3>
              <p className="font-mono text-[8px] text-truth-accentRed truncate uppercase italic">@{user?.shadowName || "shadow_none"}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            disabled={isPending}
            className="w-full py-2 bg-truth-midGray/50 border border-truth-midGray text-truth-textGray font-mono text-[9px] uppercase tracking-widest hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3 h-3" />
            Terminate Session
          </button>
        </div>
      </div>
    </aside>
  )
}
