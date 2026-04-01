import { auth } from "@/auth"
import Sidebar from "@/components/shared/Sidebar"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/shared/SidebarProvider"
import MainContent from "@/components/shared/MainContent"
import RightSidebar from "@/components/shared/RightSidebar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <div className="flex bg-truth-bg min-h-screen">
        {/* Sidebar - Fixed on left */}
        <Sidebar user={session.user} />
        
        {/* Main Content Area */}
        <MainContent>
          {/* Subtle background glow effect */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-truth-accentRed/5 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-truth-accentBlue/5 blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            {children}
          </div>
        </MainContent>

        {/* Right Sidebar - Sticky on right */}
        <RightSidebar />

        {/* Decorative Border Overlay */}
        <div className="fixed inset-0 border-20 border-truth-nearBlack pointer-events-none z-100 opacity-50" />
      </div>
    </SidebarProvider>
  )
}
