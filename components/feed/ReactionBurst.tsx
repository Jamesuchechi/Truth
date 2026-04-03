"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export function ReactionBurst({ color }: { color: string }) {
  const [particles] = useState<Particle[]>(() => 
    Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
      color: color,
      size: Math.random() * 4 + 2,
    }))
  );

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: p.x, 
            y: p.y, 
            opacity: 0, 
            scale: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{ 
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 10px ${p.color}`
          }}
        />
      ))}
    </div>
  );
}
