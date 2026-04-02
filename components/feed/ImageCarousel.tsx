"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import Image from "next/image"

interface ImageCarouselProps {
  media: { url: string; type: "IMAGE" | "VIDEO" | "AUDIO" }[]
  priority?: boolean
}

export default function ImageCarousel({ media, priority = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    const newIndex = (currentIndex + newDirection + media.length) % media.length
    setDirection(newDirection)
    setCurrentIndex(newIndex)
  }

  if (media.length === 0) return null

  return (
    <div className="relative group aspect-video md:aspect-square w-full bg-black rounded-xl overflow-hidden border border-truth-midGray/30 shadow-2xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(_e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute inset-0"
        >
          <Image
            src={media[currentIndex].url}
            alt={`Transmission Frame ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={priority && currentIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Aesthetic Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {media.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-truth-accentRed"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-truth-accentRed"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Media Metadata & Indicators */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
         <div className="flex gap-1.5">
           {media.map((_, idx) => (
             <div 
               key={idx}
               className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex ? "w-6 bg-truth-accentRed" : "w-1.5 bg-white/30"}`}
             />
           ))}
         </div>
         
         <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/50 bg-black/40 backdrop-blur-md px-2 py-1 rounded">
              SIGNAL_{String(currentIndex + 1).padStart(2, '0')}/{String(media.length).padStart(2, '0')}
            </span>
            <button className="p-1.5 bg-black/40 text-white/70 backdrop-blur-md rounded hover:text-truth-accentRed transition-colors">
               <Maximize2 className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>

      {/* Protocol Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-size-[100%_2px,3px_100%] z-10 opacity-50" />
    </div>
  )
}
