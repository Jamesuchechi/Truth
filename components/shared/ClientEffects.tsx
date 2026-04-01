// components/shared/ClientEffects.tsx
"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

export default function ClientEffects() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[4px] bg-truth-accentRed origin-left z-99999"
        style={{ scaleX }}
      />

      {/* Cursor Trail Effect */}
      <motion.div
        className="fixed w-5 h-5 bg-truth-accentRed rounded-full pointer-events-none z-9998 mix-blend-difference hidden md:block"
        animate={{
          x: mousePos.x - 10,
          y: mousePos.y - 10,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 450, mass: 0.5 }}
      />
    </>
  )
}
