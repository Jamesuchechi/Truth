"use client"

import React from "react"
import { cn } from "@/lib/utils"

export default function MainContent({ 
  children,
  ...props
}: { 
  children: React.ReactNode 
} & React.HTMLAttributes<HTMLElement>) {

  return (
    <main 
      {...props}
      className={cn(
        "flex-1 relative min-h-screen transition-all duration-300",
        props.className
      )}
    >
      <div className="p-4 md:p-8 pb-32 md:pb-8">
        {children}
      </div>
    </main>
  )
}
