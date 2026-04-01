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
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { logoutUser } from "@/lib/actions/user"
import { getSubscribedChannels } from "@/lib/actions/channel"
import { useTransition, useState, useEffect } from "react"
import { useSidebar } from "./SidebarProvider"

const navItems = [
  { href: "/feed", icon: Home, label: "Feed", description: "The Pulse" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox", description: "Internal Comms" },
  { href: "/channels", icon: Hash, label: "Channels", description: "Frequency Filters" },
  { href: "/settings", icon: Settings, label: "Settings", description: "Protocol Config" },
]

export default function Sidebar({ user }: { user: { id: string; username?: string | null; image?: string | null; shadowName?: string | null } }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [subscribedChannels, setSubscribedChannels] = useState<{id: string, name: string, slug: string, color: string | null}[]>([])

  useEffect(() => {
    const fetchChannels = async () => {
      const data = await getSubscribedChannels()
      setSubscribedChannels(data)
    }
    fetchChannels()
  }, [])

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser()
    })
  }

  return (
    <aside className={`h-screen fixed left-0 top-0 bg-truth-nearBlack border-r-2 border-truth-midGray flex flex-col z-50 transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`}>
      {/* Branding & Toggle */}
      <div className={`p-6 border-b-2 border-truth-midGray relative group overflow-hidden ${isCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"}`}>
         <motion.div 
           initial={{ x: -20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="relative z-10 flex items-center gap-3"
         >
           <div className={`shrink-0 w-10 h-10 bg-truth-accentRed flex items-center justify-center rounded-sm transition-transform duration-300 ${isCollapsed ? "scale-90" : ""}`}>
             <Shield className="text-truth-bg w-6 h-6" />
           </div>
           {!isCollapsed && (
             <motion.div
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
             >
               <h1 className="font-bitter text-2xl font-black text-truth-textLight tracking-tighter uppercase leading-none">
                 TRUTH<span className="text-truth-accentRed">OS</span>
               </h1>
               <p className="font-mono text-[8px] text-truth-textGray uppercase tracking-[0.2em] mt-1">
                 Identity Protocol v4.0.2
               </p>
             </motion.div>
           )}
         </motion.div>

         {/* Toggle Button - Now at the Top */}
         <button 
           onClick={toggleSidebar}
           className={`
             group p-2 hover:bg-truth-accentRed/10 text-truth-textGray hover:text-truth-accentRed transition-all
             ${isCollapsed ? "mt-2" : ""}
           `}
           title={isCollapsed ? "Expand Protocol" : "Collapse Protocol"}
         >
           {isCollapsed ? (
             <ChevronRight className="w-5 h-5 animate-pulse" />
           ) : (
             <ChevronLeft className="w-5 h-5" />
           )}
         </button>

         {/* Background Scanline effect overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,300%_100%] z-0 opacity-20 pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div className={`
                relative p-4 flex items-center gap-4 border-2 transition-all duration-300
                ${isCollapsed ? "justify-center px-0" : ""}
                ${isActive 
                  ? "bg-truth-accentRed/10 border-truth-accentRed text-truth-accentLight shadow-[4px_4px_0px_rgba(255,51,102,0.2)]" 
                  : "bg-transparent border-transparent text-truth-textGray hover:border-truth-midGray hover:text-truth-textLight"}
              `}>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-truth-accentRed" : "group-hover:text-truth-accentRed"}`} />
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col overflow-hidden"
                  >
                    <span className="font-bitter font-bold text-sm uppercase tracking-wide truncate">{item.label}</span>
                    <span className="font-mono text-[8px] uppercase opacity-50 truncate">{item.description}</span>
                  </motion.div>
                )}
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

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pt-8 px-4 space-y-6"
            >
               {/* Channels Section */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[9px] text-truth-textGray uppercase tracking-widest flex items-center gap-2">
                      <Hash className="w-3 h-3 text-truth-accentRed" /> Protocol Signals
                    </p>
                    <Link href="/channels" className="font-mono text-[8px] text-truth-accentBlue hover:underline uppercase">Matrix</Link>
                  </div>
                  <div className="space-y-1">
                    {subscribedChannels.length > 0 ? (
                      subscribedChannels.map(channel => (
                        <Link 
                          key={channel.id} 
                          href={`/channels/${channel.slug}`}
                          className={`
                            flex items-center gap-3 p-2 border-l-2 text-[10px] uppercase font-mono tracking-wider transition-all
                            ${pathname === `/channels/${channel.slug}` 
                              ? "bg-truth-accentRed/5 border-truth-accentRed text-truth-textLight" 
                              : "border-transparent text-truth-textGray hover:bg-truth-darkGray/50 hover:text-truth-textLight"}
                          `}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: channel.color || "#FF3366" }} />
                          {channel.name}
                        </Link>
                      ))
                    ) : (
                      <p className="font-mono text-[8px] text-truth-textGray/40 italic px-2">No signals synchronized...</p>
                    )}
                  </div>
               </div>

               <div className="h-px bg-truth-midGray w-full" />

               {/* Stats Section */}
               <div>
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
            </motion.div>
          )}

          {isCollapsed && subscribedChannels.length > 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="pt-8 flex flex-col items-center gap-4"
             >
               <div className="h-px bg-truth-midGray w-8" />
               {subscribedChannels.slice(0, 5).map(channel => (
                 <Link 
                   key={channel.id} 
                   href={`/channels/${channel.slug}`}
                   title={channel.name}
                   className={`w-2 h-2 rounded-full transition-transform hover:scale-150 ${pathname === `/channels/${channel.slug}` ? "ring-2 ring-truth-accentRed ring-offset-2 ring-offset-truth-bg" : ""}`}
                   style={{ backgroundColor: channel.color || "#FF3366" }}
                 />
               ))}
             </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* User Card & Toggle */}
      <div className="mt-auto border-t-2 border-truth-midGray bg-truth-nearBlack">
        <div className="p-4">
          <div className={`bg-truth-darkGray border border-truth-midGray rounded-sm transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
            <Link href={`/${user?.username}`} className={`flex items-center gap-3 group/user hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center mb-0" : "mb-4"}`}>
              <div className="shrink-0 w-10 h-10 border-2 border-truth-accentRed p-0.5 group-hover/user:border-truth-textLight transition-colors">
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
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="overflow-hidden"
                >
                  <h3 className="font-bitter font-black text-xs text-truth-textLight truncate uppercase group-hover/user:text-truth-accentRed transition-colors">{user?.username || "Agent Null"}</h3>
                  <p className="font-mono text-[8px] text-truth-accentRed truncate uppercase italic">@{user?.shadowName || "shadow_none"}</p>
                </motion.div>
              )}
            </Link>
            
            {!isCollapsed && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleLogout}
                disabled={isPending}
                className="w-full py-2 bg-truth-midGray/50 border border-truth-midGray text-truth-textGray font-mono text-[9px] uppercase tracking-widest hover:bg-truth-accentRed hover:text-truth-bg hover:border-truth-accentRed transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Terminate Session
              </motion.button>
            )}
          </div>
        </div>

        {/* Dynamic Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="w-full py-3 bg-truth-midGray/20 hover:bg-truth-accentRed/10 border-t border-truth-midGray text-truth-textGray hover:text-truth-accentRed transition-all flex items-center justify-center group"
          title={isCollapsed ? "Expand Protocol" : "Collapse Protocol"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="font-mono text-[8px] uppercase tracking-[0.3em] font-bold">Minimize Interface</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
