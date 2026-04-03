import type { Metadata } from "next";
import { Bitter, Crimson_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/SessionProvider";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["900"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "TRUTH | Radical Honesty Signal Protocol",
  description: "Synchronize your radical honesty. Truth is an anonymous signal protocol for uncensored human connection. Protocol version 0.1.0_BETA",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "TRUTH | Signal Protocol",
    description: "Radical Honesty. Anonymous Connection.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRUTH",
    description: "Radical Honesty Signal Protocol",
    images: ["/logo.png"],
    site: "@truth_protocol",
  }
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bitter.variable} ${crimsonPro.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "system", "ultra-contrast"]}
        >
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
