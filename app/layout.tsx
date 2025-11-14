// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}