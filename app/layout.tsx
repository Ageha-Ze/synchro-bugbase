// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"         // <html class="dark"> → Tailwind dark mode aktif
          defaultTheme="system"     // ikut tema OS
          enableSystem={true}       // perbolehkan deteksi sistem
        >
        <ToastProvider>
          {children}
        </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
