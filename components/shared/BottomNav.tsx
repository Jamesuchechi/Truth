"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, MessageSquare, User, Hash } from "lucide-react"
import { motion } from "framer-motion"
import NotificationBadge from "../notifications/NotificationBadge"

import { useSidebar } from "./SidebarProvider"

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/notifications", icon: Bell, label: "Signals" },
  { href: "/channels", icon: Hash, label: "Channels" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox" },
]

export default function BottomNav({ user }: { user: { username?: string | null } }) {
  const pathname = usePathname()
  const { isMobileMenuOpen } = useSidebar()

  if (isMobileMenuOpen) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-xl border-t-2 border-border z-60 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-full items-center px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 group relative">
              <div className={`p-2 rounded-sm transition-all duration-300 ${isActive ? "text-truth-accentRed bg-truth-accentRed/5" : "text-muted hover:text-foreground"}`}>
                <item.icon className="w-5 h-5" />
                {item.href === "/notifications" && <NotificationBadge />}
              </div>
              <span className={`font-mono text-[7px] uppercase tracking-widest ${isActive ? "text-truth-accentRed opacity-100" : "opacity-0"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-px left-1/4 right-1/4 h-0.5 bg-truth-accentRed shadow-[0_0_10px_rgba(255,51,102,0.5)]"
                />
              )}
            </Link>
          )
        })}
        <Link href={`/${user.username}`} className="flex flex-col items-center justify-center gap-1 group relative">
          <div className={`p-2 rounded-sm transition-all duration-300 ${pathname?.startsWith("/" + user.username) ? "text-truth-accentBlue bg-truth-accentBlue/5" : "text-muted hover:text-foreground"}`}>
            <User className="w-5 h-5" />
          </div>
          <span className={`font-mono text-[7px] uppercase tracking-widest ${pathname?.startsWith("/" + user.username) ? "text-truth-accentBlue opacity-100" : "opacity-0"}`}>
            Profile
          </span>
          {pathname?.startsWith("/" + user.username) && (
            <motion.div 
              layoutId="activeTab"
              className="absolute -top-px left-1/4 right-1/4 h-0.5 bg-truth-accentBlue shadow-[0_0_10px_rgba(0,191,255,0.5)]"
            />
          )}
        </Link>
      </div>
    </nav>
  )
}
