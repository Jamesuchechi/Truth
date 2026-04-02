"use client"

import React from "react"

export default function FeedSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="bg-truth-nearBlack border-2 border-truth-midGray/20 p-8 shadow-[10px_10px_0px_rgba(0,0,0,0.1)]"
        >
          {/* Header Skeleton */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-truth-midGray/20" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-truth-midGray/20" />
                <div className="h-2 w-32 bg-truth-midGray/10" />
              </div>
            </div>
            <div className="w-6 h-6 bg-truth-midGray/10" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-truth-midGray/20" />
            <div className="h-4 w-[90%] bg-truth-midGray/20" />
            <div className="h-4 w-[40%] bg-truth-midGray/20" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between pt-6 border-t border-truth-midGray/10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-4 bg-truth-midGray/10" />
              <div className="w-12 h-4 bg-truth-midGray/10" />
              <div className="w-12 h-4 bg-truth-midGray/10" />
            </div>
            <div className="w-20 h-4 bg-truth-midGray/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
