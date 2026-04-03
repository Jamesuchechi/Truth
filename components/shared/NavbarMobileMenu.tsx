"use client"

import { useState } from "react"
import Link from "next/link"
import { User as UserIcon, LogOut } from "lucide-react"
import { logoutUser } from "@/lib/actions/user"
import { motion, AnimatePresence } from "framer-motion"

interface User {
  username?: string | null;
}

export default function NavbarMobileMenu({ user }: { user: User | undefined | null }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-truth-textLight hover:text-truth-accentRed transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-truth-bg/95 border-b border-truth-midGray/50 backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl z-50 md:hidden"
          >
            <Link 
              href="#features" 
              onClick={() => setIsOpen(false)}
              className="font-mono text-xs uppercase tracking-[0.3em] text-truth-textLight hover:text-truth-accentRed transition-colors"
            >
              Intelligence
            </Link>
            <Link 
              href="#confessions" 
              onClick={() => setIsOpen(false)}
              className="font-mono text-xs uppercase tracking-[0.3em] text-truth-textLight hover:text-truth-accentRed transition-colors"
            >
              Confessions
            </Link>
            
            <div className="h-px w-full bg-truth-midGray/50" />
            
            {!user ? (
              <div className="flex flex-col gap-4">
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-xs uppercase tracking-[0.3em] text-truth-textLight hover:text-truth-accentRed transition-colors font-bold"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 border-2 text-center border-truth-accentRed text-truth-accentRed font-mono text-xs uppercase tracking-[0.3em] font-bold hover:bg-truth-accentRed hover:text-truth-bg transition-all active:scale-95 shadow-[4px_4px_0px_rgba(255,51,102,0.2)]"
                >
                  Join Network
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-truth-nearBlack border border-truth-midGray">
                  <UserIcon className="w-4 h-4 text-truth-accentRed" />
                  <span className="font-mono text-xs uppercase tracking-widest text-truth-textLight">
                    {user.username || 'Anonymous'}
                  </span>
                </div>
                <form action={logoutUser} onSubmit={() => setIsOpen(false)}>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-truth-accentRed/10 border border-truth-accentRed/30 focus:outline-none font-mono text-xs uppercase tracking-[0.3em] text-truth-accentRed hover:bg-truth-accentRed hover:text-truth-bg transition-colors font-bold">
                     Kill Session
                     <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-truth-textGray hover:text-truth-accentRed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
