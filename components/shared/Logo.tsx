"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  variant?: "solid" | "ghost"
}

/**
 * TRUTH Official Brand Logo Component.
 * Replaces the legacy 'Zap' icons.
 */
export default function Logo({ className, size = 24, variant = "solid" }: LogoProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        variant === "ghost" && "opacity-80 hover:opacity-100",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Truth Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      
      {/* Optional subtle glow for 'active' states */}
      <div className="absolute inset-0 bg-truth-accentRed/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
