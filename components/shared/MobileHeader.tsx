"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useSidebar } from "./SidebarProvider"
import Logo from "./Logo"

export default function MobileHeader() {
  const { toggleMobileMenu } = useSidebar()

  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b-2 border-border z-50 flex items-center justify-between px-6 lg:hidden">
      <Link href="/feed" className="flex items-center gap-2 group">
        <Logo size={32} className="group-active:scale-95 transition-transform" />
        <span className="font-bitter text-xl font-black uppercase tracking-tighter text-foreground">
          TRUTH<span className="text-truth-accentRed">OS</span>
        </span>
      </Link>

      <button 
        onClick={toggleMobileMenu}
        className="p-2 bg-muted/5 border border-border rounded-sm hover:bg-truth-accentRed/10 hover:border-truth-accentRed/50 transition-all active:scale-95"
        aria-label="Open Protocol Menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </button>
    </header>
  )
}
