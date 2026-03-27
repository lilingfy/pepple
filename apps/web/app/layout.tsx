import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_SC, Noto_Serif_SC, Public_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { pebbleCssVariables } from "@/lib/design-system/tokens";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pebble AI",
  description: "Pebble AI - 情绪防御助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="zh-CN"
        className={`${inter.variable} ${notoSansSC.variable} ${notoSerifSC.variable} ${publicSans.variable}`}
        style={pebbleCssVariables as CSSProperties}
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          />
        </head>
        <body className="font-sans antialiased">
          {children}
          <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                      console.log('Service Worker registered: ', registration);
                    },
                    (error) => {
                      console.log('Service Worker registration failed: ', error);
                    }
                  );
                });
              }
            `,
          }}
        />
        </body>
      </html>
    </ClerkProvider>
  );
}
