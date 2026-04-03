"use client"

import React from "react"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/lib/utils"

export default function MainContent({ 
  children,
  ...props
}: { 
  children: React.ReactNode 
} & React.HTMLAttributes<HTMLElement>) {
  const { isCollapsed } = useSidebar()

  return (
    <main 
      {...props}
      className={cn(
        "flex-1 relative min-h-screen transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-72",
        props.className
      )}
    >
      <div className="p-4 md:p-8 pb-32 md:pb-8">
        {children}
      </div>
    </main>
  )
}
