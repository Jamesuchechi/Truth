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
          nearBlack: "#141414",
          darkGray: "#1F1F1F",
          midGray: "#2A2A2A",
          textGray: "#888888",
          textLight: "#E0E0E0",
          accentRed: "#FF3366",
          accentPurple: "#9D50BB",
          accentBlue: "#6E48AA",
          accentGreen: "#10B981",
          accentYellow: "#F59E0B",
          // Deprecated/Compatibility keys
          accent: "#FF3366", // Redirecting accent to Red for brutalist look
          muted: "#888888",
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
};

export default config;