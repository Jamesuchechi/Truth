"use client"

import React from "react"
import { useSidebar } from "./SidebarProvider"

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main 
      className={`flex-1 relative min-h-screen transition-all duration-300 ${
        isCollapsed ? "ml-20" : "ml-72"
      } xl:mr-80`}
    >
      <div className="p-4 md:p-8">
        {children}
      </div>
    </main>
  )
}
