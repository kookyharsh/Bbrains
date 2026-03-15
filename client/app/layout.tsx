import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const kalam = Kalam({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

const patrickHand = Patrick_Hand({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-patrick",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BBrains - Smart Learning Platform",
  description: "A modern platform for smart learning and collaboration.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BBrains",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/theme-provider"
import { ThemeProvider as ThemeContextProvider } from "@/context/theme-context"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${kalam.variable} ${patrickHand.variable}`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider enableSystem disableTransitionOnChange>
          <ThemeContextProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </ThemeContextProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
