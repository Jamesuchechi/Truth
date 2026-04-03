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
  ChevronRight,
  ChevronLeft,
  Ghost,
  Bell,
  Users,
  Sun,
  Moon,
  Monitor,
  Eye
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { logoutUser, updateSettings } from "@/lib/actions/user"
import { getSubscribedChannels } from "@/lib/actions/channel"
import { getFollowers, getFollowing } from "@/lib/actions/follow"
import { useTransition, useState, useEffect } from "react"
import { useSidebar } from "./SidebarProvider"
import NotificationBadge from "../notifications/NotificationBadge"

const navItems = [
  { href: "/feed", icon: Home, label: "Feed", description: "The Pulse" },
  { href: "/notifications", icon: Bell, label: "Signals", description: "Feedback Loop" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox", description: "Internal Comms" },
  { href: "/channels", icon: Hash, label: "Channels", description: "Frequency Filters" },
  { href: "/settings", icon: Settings, label: "Settings", description: "Protocol Config" },
]

export default function Sidebar({ user }: { user: { 
  id: string; 
  username?: string | null; 
  image?: string | null; 
  shadowName?: string | null;
  defaultShadowMode?: boolean;
  reputationScore?: number;
  reputationTier?: string;
} }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const { isCollapsed, toggleSidebar, isMobileMenuOpen, closeMobileMenu } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [subscribedChannels, setSubscribedChannels] = useState<{id: string, name: string, slug: string, color: string | null}[]>([])
  const [counts, setCounts] = useState({ followers: 0, following: 0 })

  // Handle hydration to prevent mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Handle data synchronization
  useEffect(() => {
    const fetchData = async () => {
      const [channels, followers, following] = await Promise.all([
        getSubscribedChannels(),
        getFollowers(user.id),
        getFollowing(user.id)
      ])
      setSubscribedChannels(channels)
      setCounts({ followers: followers.length, following: following.length })
    }
    fetchData()
  }, [user.id])

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser()
    })
  }

  // Prevent hydration mismatch
  if (!mounted) return (
    <aside className={`h-screen fixed left-0 top-0 bg-card border-r-2 border-border hidden lg:flex lg:flex-col z-50 transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`} />
  )

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-90 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed left-0 top-0 h-screen bg-card border-r-2 border-border flex flex-col z-100 transition-all duration-300
        ${isMobileMenuOpen ? "translate-x-0 w-[70vw] shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        lg:sticky lg:h-screen
      `}>
      {/* Branding & Toggle */}
      <div className={`p-6 border-b-2 border-border relative group overflow-hidden ${isCollapsed ? "flex flex-col items-center gap-4" : "flex items-center justify-between"}`}>
         <motion.div 
           initial={{ x: -20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="relative z-10 flex items-center gap-3"
         >
           <div className={`shrink-0 w-10 h-10 bg-truth-accentRed flex items-center justify-center rounded-sm transition-transform duration-300 ${isCollapsed ? "scale-90" : ""}`}>
             <Shield className="text-black w-6 h-6" />
           </div>
           {!isCollapsed && (
             <motion.div
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
             >
               <h1 className="font-bitter text-2xl font-black text-foreground tracking-tighter uppercase leading-none">
                 TRUTH<span className="text-truth-accentRed">OS</span>
               </h1>
               <p className="font-mono text-[8px] text-muted uppercase tracking-[0.2em] mt-1">
                 Identity Protocol v4.0.2
               </p>
             </motion.div>
           )}
         </motion.div>

         {/* Toggle Button */}
         <button 
           onClick={toggleSidebar}
           className={`
             group p-2 hover:bg-truth-accentRed/10 text-muted hover:text-truth-accentRed transition-all
             ${isCollapsed ? "mt-2" : ""}
           `}
           title={isCollapsed ? "Expand Protocol" : "Collapse Protocol"}
         >
           {isCollapsed ? (
             <ChevronRight className="w-5 h-5" />
           ) : (
             <ChevronLeft className="w-5 h-5" />
           )}
         </button>

         {/* Background Scanline effect overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-size-[100%_2px] z-0 opacity-10 pointer-events-none" />
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
                  ? "bg-truth-accentRed/5 border-truth-accentRed text-truth-accentRed shadow-[4px_4px_0px_rgba(255,51,102,0.1)]" 
                  : "bg-transparent border-transparent text-muted hover:border-border hover:text-foreground"}
              `}>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-truth-accentRed" : "group-hover:text-truth-accentRed"}`} />
                {item.href === "/notifications" && <NotificationBadge />}
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
               {/* UI Protocol (Theme Switcher) */}
               <div>
                  <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Monitor className="w-3 h-3 text-truth-accentBlue" /> UI_PROTOCOL
                  </p>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-muted/10 border border-border rounded-sm">
                    <button 
                      onClick={() => setTheme("light")}
                      className={`p-2 flex flex-col items-center gap-1 transition-all ${theme === 'light' ? 'bg-card border border-border shadow-sm text-truth-accentYellow' : 'text-muted hover:text-foreground'}`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span className="text-[6px] font-mono uppercase font-bold">Light</span>
                    </button>
                    <button 
                      onClick={() => setTheme("dark")}
                      className={`p-2 flex flex-col items-center gap-1 transition-all ${theme === 'dark' ? 'bg-card border border-border shadow-sm text-truth-accentPurple' : 'text-muted hover:text-foreground'}`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span className="text-[6px] font-mono uppercase font-bold">Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme("ultra-contrast")}
                      className={`p-2 flex flex-col items-center gap-1 transition-all ${theme === 'ultra-contrast' ? 'bg-card border border-border shadow-sm text-truth-accentGreen' : 'text-muted hover:text-foreground'}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[6px] font-mono uppercase font-bold">Ultra</span>
                    </button>
                    <button 
                      onClick={() => setTheme("system")}
                      className={`p-2 flex flex-col items-center gap-1 transition-all ${theme === 'system' ? 'bg-card border border-border shadow-sm text-truth-accentBlue' : 'text-muted hover:text-foreground'}`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span className="text-[6px] font-mono uppercase font-bold">Auto</span>
                    </button>
                  </div>
               </div>

               <div className="h-px bg-border w-full" />

               {/* Channels Section */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-[9px] text-muted uppercase tracking-widest flex items-center gap-2">
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
                              ? "bg-truth-accentRed/5 border-truth-accentRed text-foreground" 
                              : "border-transparent text-muted hover:bg-muted/10 hover:text-foreground"}
                          `}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: channel.color || "#FF3366" }} />
                          {channel.name}
                        </Link>
                      ))
                    ) : (
                      <p className="font-mono text-[8px] text-muted/40 italic px-2">No signals synchronized...</p>
                    )}
                  </div>
               </div>

                <div className="h-px bg-border w-full" />

                {/* Network Connections Section */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                     <p className="font-mono text-[9px] text-muted uppercase tracking-widest flex items-center gap-2">
                       <Users className="w-3 h-3 text-truth-accentBlue" /> Signal Network
                     </p>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href={`/${user.username}/followers`}
                        className="p-3 bg-muted/5 border border-border hover:border-truth-accentBlue/30 transition-all text-center group"
                      >
                         <p className="font-bitter font-black text-xs text-foreground group-hover:text-truth-accentBlue">{counts.followers}</p>
                         <p className="font-mono text-[7px] text-muted uppercase">Observers</p>
                      </Link>
                      <Link 
                        href={`/${user.username}/following`}
                        className="p-3 bg-muted/5 border border-border hover:border-truth-accentBlue/30 transition-all text-center group"
                      >
                         <p className="font-bitter font-black text-xs text-foreground group-hover:text-truth-accentBlue">{counts.following}</p>
                         <p className="font-mono text-[7px] text-muted uppercase">Signals</p>
                      </Link>
                   </div>
                </div>

                <div className="h-px bg-border w-full" />

               {/* Stats Section */}
               <div>
                  <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-truth-accentRed" /> Network Status
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[8px] font-mono uppercase">
                      <span className="text-muted">Encryption Level</span>
                      <span className="text-truth-accentGreen">AES-256</span>
                    </div>
                     <div className="flex items-center justify-between text-[8px] font-mono uppercase">
                       <span className="text-muted">Protocol Lag</span>
                       <span className="text-truth-accentRed">12ms</span>
                     </div>
                     <div className="pt-2">
                       <div className="flex items-center justify-between text-[8px] font-mono uppercase mb-1">
                         <span className="text-muted font-bold">Signal Reputation</span>
                         <span className={user?.reputationScore && user.reputationScore > 50 ? "text-truth-accentGreen" : "text-truth-accentYellow"}>
                           {user?.reputationScore || 0}%
                         </span>
                       </div>
                       <div className="w-full h-1 bg-muted/10 overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${user?.reputationScore || 0}%` }}
                           className={`h-full ${user?.reputationScore && user.reputationScore > 50 ? "bg-truth-accentGreen" : "bg-truth-accentYellow"}`}
                         />
                       </div>
                       <p className="font-mono text-[7px] text-muted uppercase mt-1">Tier: {user?.reputationTier || "NEOPHYTE"}</p>
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
               <div className="h-px bg-border w-8" />
               {subscribedChannels.slice(0, 5).map(channel => (
                 <Link 
                   key={channel.id} 
                   href={`/channels/${channel.slug}`}
                   title={channel.name}
                   className={`w-2 h-2 rounded-full transition-transform hover:scale-150 ${pathname === `/channels/${channel.slug}` ? "ring-2 ring-truth-accentRed ring-offset-2 ring-offset-background" : ""}`}
                   style={{ backgroundColor: channel.color || "#FF3366" }}
                 />
               ))}
             </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* User Card & Toggle */}
      <div className="mt-auto border-t-2 border-border bg-card">
        <div className="p-4">
          <div className={`bg-background border border-border rounded-sm transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
            <Link href={`/${user?.username}`} className={`flex items-center gap-3 group/user hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center mb-0" : "mb-4"}`}>
              <div className="shrink-0 w-10 h-10 border-2 border-truth-accentRed p-0.5 group-hover/user:border-foreground transition-colors">
                 <div className="relative w-full h-full bg-muted/10 flex items-center justify-center overflow-hidden">
                   {user?.image ? (
                     <Image 
                       src={user.image} 
                       alt={user.username || "Agent Avatar"} 
                       fill 
                       className="object-cover"
                       sizes="40px"
                     />
                   ) : (
                     <User className="w-5 h-5 text-muted" />
                   )}
                 </div>
              </div>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="overflow-hidden"
                >
                  <h3 className="font-bitter font-black text-xs text-foreground truncate uppercase group-hover/user:text-truth-accentRed transition-colors">{user?.username || "Agent Null"}</h3>
                  <p className="font-mono text-[8px] text-truth-accentRed truncate uppercase italic">@{user?.shadowName || "shadow_none"}</p>
                </motion.div>
              )}
            </Link>
            
            {!isCollapsed && (
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    startTransition(async () => {
                      await updateSettings({ defaultShadowMode: !user?.defaultShadowMode })
                    })
                  }}
                  disabled={isPending}
                  className={`w-full py-2 border font-mono text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${user?.defaultShadowMode ? "bg-truth-accentRed/20 border-truth-accentRed text-truth-accentRed" : "bg-muted/5 border-border text-muted hover:border-foreground hover:text-foreground"}`}
                >
                  <Ghost className={`w-3.5 h-3.5 ${user?.defaultShadowMode ? "animate-pulse" : ""}`} />
                  {user?.defaultShadowMode ? "SHADOW_ACTIVE" : "SHADOW_STANDBY"}
                </button>

                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleLogout}
                  disabled={isPending}
                  className="w-full py-2 bg-muted/10 border border-border text-muted font-mono text-[9px] uppercase tracking-widest hover:bg-truth-accentRed hover:text-black hover:border-truth-accentRed transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3 h-3" />
                  Terminate Session
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="w-full py-3 bg-muted/5 hover:bg-truth-accentRed/10 border-t border-border text-muted hover:text-truth-accentRed transition-all flex items-center justify-center group"
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
    </>
  )
}
