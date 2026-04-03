"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "j":
          // Next post logic (this would need to be handled by a context or state manager)
          window.dispatchEvent(new CustomEvent("truth-nav-next"))
          break
        case "k":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            window.dispatchEvent(new CustomEvent("truth-command-palette"))
          } else {
            // Previous post logic
            window.dispatchEvent(new CustomEvent("truth-nav-prev"))
          }
          break
        case "c":
          // Compose new post
          window.dispatchEvent(new CustomEvent("truth-compose"))
          break
        case "n":
          router.push("/notifications")
          break
        case "h":
          router.push("/feed")
          break
        case "/":
          e.preventDefault()
          window.dispatchEvent(new CustomEvent("truth-search"))
          break
        case "?":
          // Show help modal
          window.dispatchEvent(new CustomEvent("truth-help"))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])
}
