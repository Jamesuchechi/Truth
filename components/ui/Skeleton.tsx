"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rect" | "circle" | "text"
}

export function Skeleton({ 
  className, 
  variant = "rect", 
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/10",
        variant === "circle" && "rounded-full",
        variant === "rect" && "rounded-sm",
        variant === "text" && "rounded-sm h-4 w-full",
        // Shimmer effect
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-linear-to-r after:from-transparent after:via-foreground/5 after:to-transparent",
        className
      )}
      {...props}
    />
  )
}
