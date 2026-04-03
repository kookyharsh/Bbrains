import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Kalam, Patrick_Hand } from "next/font/google";
import { cookies } from "next/headers";
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

import { ThemeProvider } from "@/context/theme"
import { UiModeProvider, type UiMode } from "@/context/ui-mode"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const uiModeCookie = cookieStore.get("ui-mode")?.value;
  const initialUiMode: UiMode = uiModeCookie === "new" ? "new" : "classic";

  return (
    <html lang="en" className={`${inter.variable} ${kalam.variable} ${patrickHand.variable}`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <UiModeProvider initialMode={initialUiMode}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </UiModeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
