import React from "react"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-truth-bg flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-truth-nearBlack border-2 border-truth-midGray p-8 md:p-16 shadow-[20px_20px_0px_rgba(0,0,0,0.3)]">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
