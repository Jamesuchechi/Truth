import { auth } from "@/auth";
import Sidebar from "@/components/shared/Sidebar";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/shared/SidebarProvider";
import MainContent from "@/components/shared/MainContent";
import RightSidebar from "@/components/shared/RightSidebar";
import PageTransition from "@/components/shared/PageTransition";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import BottomNav from "@/components/shared/BottomNav";
import ClientEffects from "@/components/shared/ClientEffects";
import MobileHeader from "@/components/shared/MobileHeader";
import CommandPalette from "@/components/shared/CommandPalette";
import PerformanceAnalytics from "@/components/shared/PerformanceAnalytics";
import { prisma } from "@/lib/db/prisma";
import Footer from "@/components/shared/Footer";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // ONBOARDING GUARD: JWT token may be stale (e.g. user completed onboarding
  // before the JWT was refreshed). Trust the DB as the source of truth.
  let hasCompletedOnboarding = session.user.hasCompletedOnboarding ?? false;
  if (!hasCompletedOnboarding) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true },
    });
    hasCompletedOnboarding = dbUser?.hasCompletedOnboarding ?? false;
  }

  return (
    <SidebarProvider>
      <ClientEffects />
      <div className="bg-background flex min-h-screen">
        <a
          href="#main-content"
          className="bg-truth-accentRed sr-only fixed top-4 left-4 z-200 px-4 py-2 font-mono text-xs font-bold text-black uppercase focus:not-sr-only"
        >
          Skip_to_Content
        </a>
        {/* Sidebar - Fixed on left / Drawer on mobile */}
        <Sidebar user={session.user} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header */}
          <MobileHeader />

          {/* Main Content Area */}
          <MainContent id="main-content">
            {/* Subtle background glow effect - Adjusted for theme */}
            <div className="pointer-events-none fixed inset-0 z-0">
              <div className="bg-truth-accentRed/5 absolute top-0 right-0 h-[500px] w-[500px] opacity-30 blur-[120px] dark:opacity-100" />
              <div className="bg-truth-accentBlue/5 absolute bottom-0 left-0 h-[300px] w-[300px] opacity-20 blur-[100px] dark:opacity-100" />
            </div>

            <div className="relative z-10 w-full max-w-[1600px]">
              <div className="flex items-start gap-6 lg:gap-8">
                <div className="min-w-0 flex-1">
                  <PageTransition>{children}</PageTransition>

                  {/* Shared Footer - Added for consistency across all sub-pages */}
                  <div className="mt-12 sm:mt-20">
                    <Footer />
                  </div>
                </div>
                <div className="hidden w-80 shrink-0 xl:block">
                  <div className="sticky top-0 h-screen">
                    <RightSidebar />
                  </div>
                </div>
              </div>
            </div>
          </MainContent>
        </div>

        {/* Decorative Border Overlay - Updated for theme readability */}
        <div className="border-16px border-card/10 pointer-events-none fixed inset-0 z-50 box-border" />

        {/* Onboarding Overlay */}
        {!hasCompletedOnboarding && <OnboardingFlow />}

        {/* Navigation Layers */}
        <BottomNav user={session.user} />
        <CommandPalette />
        <PerformanceAnalytics />
      </div>
    </SidebarProvider>
  );
}
