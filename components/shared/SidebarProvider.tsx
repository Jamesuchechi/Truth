"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use useEffect to load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (parsed !== isCollapsed) {
        setIsCollapsed(parsed)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
      return newState
    })
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <SidebarContext.Provider 
      value={{ 
        isCollapsed, 
        toggleSidebar, 
        isMobileMenuOpen, 
        toggleMobileMenu,
        closeMobileMenu 
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
