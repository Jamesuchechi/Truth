"use client"

import React from "react"
import { useSidebar } from "./SidebarProvider"

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main 
      className={`flex-1 relative min-h-screen transition-all duration-300 ${
        isCollapsed ? "ml-20" : "ml-72"
      }`}
    >
      {children}
    </main>
  )
}
