import type { Metadata } from "next";
import { Patrick_Hand, DM_Sans, Caveat, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActionTooltipProvider } from "@/components/shared/action-tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DreamForge Consulting",
  description:
    "CRM & project management for SaaS consulting — track leads, manage clients, and deliver projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${patrickHand.variable} ${caveat.variable} ${jetbrainsMono.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>
            <ActionTooltipProvider>
              {children}
            </ActionTooltipProvider>
          </TooltipProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
