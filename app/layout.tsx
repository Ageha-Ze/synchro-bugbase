"use client";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script untuk set theme sebelum React hydrate - prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const finalTheme = theme || systemTheme;
                
                if (finalTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"         // <html class="dark"> → Tailwind dark mode aktif
          defaultTheme="system"     // ikut tema OS
          enableSystem={true}       // perbolehkan deteksi sistem
        >
          <ToastProvider>
            {children}

            {/* Analytic */}
            <SpeedInsights 
              debug={process.env.NODE_ENV === "development"}
              sampleRate={1}
            />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

