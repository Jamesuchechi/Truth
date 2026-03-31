// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        truth: {
          bg: "#0A0A0A",
          surface: "#111111",
          border: "#1F1F1F",
          accent: "#3B82F6",
          text: "#EDEDED",
          muted: "#A1A1A1",
          error: "#EF4444",
          success: "#10B981",
        },
        
        // Reaction Colors
        reactions: {
          relate: '#8B5CF6',     // Purple
          deep: '#3B82F6',       // Blue
          notAlone: '#EC4899',   // Pink
          wild: '#F59E0B',       // Amber
          realTalk: '#EF4444',   // Red
          thankYou: '#10B981',   // Green
          hurts: '#6366F1',      // Indigo
          strong: '#F97316',     // Orange
        },
        
        // Tone Colors
        tones: {
          honest: '#10B981',     // Green
          harsh: '#EF4444',      // Red
          funny: '#F59E0B',      // Amber
          deep: '#6366F1',       // Indigo
          neutral: '#888888',    // Gray
        }
      }
    }
  }
}