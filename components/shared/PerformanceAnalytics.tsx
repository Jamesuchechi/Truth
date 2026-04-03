"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

/**
 * Global Performance & Analytics monitoring for Phase 9.
 * This component should be rendered once in the root layout.
 */
export default function PerformanceAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
