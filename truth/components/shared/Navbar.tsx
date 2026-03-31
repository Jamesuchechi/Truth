// components/shared/Navbar.tsx
import Link from "next/link"
import { auth } from "@/auth"
import { logoutUser } from "@/lib/actions/user"
import { Menu, User as UserIcon, LogOut, Terminal } from "lucide-react"

export default async function Navbar() {
  const session = await auth()
  const user = session?.user

  return (
    <nav className="fixed top-0 left-0 right-0 z-10000 border-b border-truth-midGray/50 bg-truth-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-truth-accentRed flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-500">
             <Terminal className="w-5 h-5 text-truth-bg" />
          </div>
          <span className="font-bitter text-2xl font-black tracking-tight uppercase group-hover:text-truth-accentRed transition-colors">
            TruTH
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors">
            Intelligence
          </Link>
          <Link href="#confessions" className="font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors">
            Confessions
          </Link>
          <div className="h-4 w-1px bg-truth-midGray/50" />
          
          {!user ? (
            <div className="flex items-center gap-6">
              <Link href="/login" className="font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors font-bold">
                Log In
              </Link>
              <Link href="/signup" className="px-6 py-2 border-2 border-truth-accentRed text-truth-accentRed font-mono text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-truth-accentRed hover:text-truth-bg transition-all active:scale-95 shadow-[4px_4px_0px_rgba(255,51,102,0.2)]">
                Join Network
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-truth-nearBlack border border-truth-midGray">
                <UserIcon className="w-3 h-3 text-truth-accentRed" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-truth-textLight">
                  {user.username || 'Anonymous'}
                </span>
              </div>
              <form action={logoutUser}>
                <button type="submit" className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors font-bold">
                   Kill Session
                   <LogOut className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger (Placeholder for now) */}
        <button className="md:hidden p-2 text-truth-textLight">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}
