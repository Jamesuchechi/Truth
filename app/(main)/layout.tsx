import { auth } from "@/auth"
import Sidebar from "@/components/shared/Sidebar"
import { redirect } from "next/navigation"
import { SidebarProvider } from "@/components/shared/SidebarProvider"
import MainContent from "@/components/shared/MainContent"
import RightSidebar from "@/components/shared/RightSidebar"
import PageTransition from "@/components/shared/PageTransition"
import OnboardingFlow from "@/components/onboarding/OnboardingFlow"
import BottomNav from "@/components/shared/BottomNav"
import ClientEffects from "@/components/shared/ClientEffects"
import MobileHeader from "@/components/shared/MobileHeader"
import CommandPalette from "@/components/shared/CommandPalette"

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
      <ClientEffects />
      <div className="flex bg-background min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only fixed top-4 left-4 z-200 bg-truth-accentRed text-black px-4 py-2 font-mono text-xs uppercase font-bold">
          Skip_to_Content
        </a>
        {/* Sidebar - Fixed on left / Drawer on mobile */}
        <Sidebar user={session.user} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <MobileHeader />
          
          {/* Main Content Area */}
          <MainContent id="main-content">
          {/* Subtle background glow effect - Adjusted for theme */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-truth-accentRed/5 blur-[120px] dark:opacity-100 opacity-30" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-truth-accentBlue/5 blur-[100px] dark:opacity-100 opacity-20" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex items-start gap-12">
               <div className="flex-1 min-w-0">
                 <PageTransition>{children}</PageTransition>
               </div>
               <div className="hidden xl:block w-80 shrink-0 sticky top-8">
                 <RightSidebar />
               </div>
            </div>
          </div>
        </MainContent>
      </div>

        {/* Decorative Border Overlay - Updated for theme readability */}
        <div className="fixed inset-0 border-16px border-card/10 pointer-events-none z-50" />
        
        {/* Onboarding Overlay */}
        {!session.user.hasCompletedOnboarding && (
          <OnboardingFlow />
        )}

        {/* Navigation Layers */}
        <BottomNav user={session.user} />
        <CommandPalette />
      </div>
    </SidebarProvider>
  )
}
