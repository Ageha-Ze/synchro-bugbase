// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
      >
        <body className="transition-colors">
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}