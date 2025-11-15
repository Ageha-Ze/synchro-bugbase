// app/layout.tsx
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <ToastProvider>
            {children}

            {/* ✅ BottomNav tampil di SEMUA halaman (mobile only) */}
            <div className="md:hidden">
              <BottomNav />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}