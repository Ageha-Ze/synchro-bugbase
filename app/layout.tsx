// app/layout.tsx
import './globals.css';
import { ToastProvider } from "@/components/ui/use-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-20 md:pb-0 bg-gray-50">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}