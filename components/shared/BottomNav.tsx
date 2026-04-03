"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, Hash, User } from "lucide-react"
import NotificationBadge from "../notifications/NotificationBadge"
import Logo from "./Logo"
import { useSidebar } from "./SidebarProvider"

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/notifications", icon: Bell, label: "Signals" },
]

export default function BottomNav({ user }: { user: { username?: string | null } }) {
  const pathname = usePathname()
  const { isMobileMenuOpen } = useSidebar()

  if (isMobileMenuOpen) return null

  const handleCompose = () => {
    window.dispatchEvent(new CustomEvent("truth-compose"))
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-xl border-t-2 border-border z-60 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-full items-center px-2">
        {/* Feed & Signals */}
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
            </Link>
          )
        })}

        {/* Central Compose Button */}
        <button 
          onClick={handleCompose}
          className="flex flex-col items-center justify-center gap-1 group relative -mt-8"
        >
          <div className="w-14 h-14 bg-truth-accentRed flex items-center justify-center rounded-sm shadow-[0_0_20px_rgba(255,51,102,0.4)] active:scale-95 transition-all border-2 border-truth-bg">
            <Logo size={32} />
          </div>
          <span className="font-mono text-[7px] uppercase tracking-widest text-truth-accentRed font-black mt-1">EMIT</span>
        </button>

        {/* Channels & Profile */}
        <Link href="/channels" className="flex flex-col items-center justify-center gap-1 group relative">
          <div className={`p-2 rounded-sm transition-all duration-300 ${pathname === "/channels" ? "text-truth-accentPurple bg-truth-accentPurple/5" : "text-muted hover:text-foreground"}`}>
            <Hash className="w-5 h-5" />
          </div>
          <span className={`font-mono text-[7px] uppercase tracking-widest ${pathname === "/channels" ? "text-truth-accentPurple opacity-100" : "opacity-0"}`}>
            Channels
          </span>
        </Link>

        <Link href={`/${user.username}`} className="flex flex-col items-center justify-center gap-1 group relative">
          <div className={`p-2 rounded-sm transition-all duration-300 ${pathname?.startsWith("/" + user.username) ? "text-truth-accentBlue bg-truth-accentBlue/5" : "text-muted hover:text-foreground"}`}>
            <User className="w-5 h-5" />
          </div>
          <span className={`font-mono text-[7px] uppercase tracking-widest ${pathname?.startsWith("/" + user.username) ? "text-truth-accentBlue opacity-100" : "opacity-0"}`}>
            Profile
          </span>
        </Link>
      </div>
    </nav>
  )
}
