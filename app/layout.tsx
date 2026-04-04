import type { Metadata, Viewport } from "next";
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

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://truth-so4f.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "TRUTH | Radical Honesty Signal Protocol",
    template: "%s | TRUTH",
  },
  description:
    "Synchronize your radical honesty. Truth is an anonymous signal protocol for uncensored human connection. Protocol version 0.1.0_BETA",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: BASE_URL,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TRUTH",
  },
  openGraph: {
    title: "TRUTH | Signal Protocol",
    description: "Radical Honesty. Anonymous Connection.",
    url: BASE_URL,
    siteName: "TRUTH",
    images: [
      {
        url: `${BASE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "TRUTH Signal Protocol",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRUTH",
    description: "Radical Honesty Signal Protocol",
    images: [`${BASE_URL}/api/og`],
    site: "@truth_protocol",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      <body className="flex min-h-full flex-col">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TRUTH",
              alternateName: "Truth Signal Protocol",
              url: BASE_URL,
              description:
                "An anonymous social protocol for radical honesty and uncensored human connection.",
              publisher: {
                "@type": "Organization",
                name: "TRUTH",
                logo: {
                  "@type": "ImageObject",
                  url: `${BASE_URL}/logo.png`,
                },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${BASE_URL}/channels?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
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
