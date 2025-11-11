// app/layout.tsx
import './globals.css';
import { ToastProvider } from "@/components/ui/use-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <SpeedInsights 
          debug={process.env.NODE_ENV === 'development'}
          sampleRate={1}
          />
        </ToastProvider>
      </body>
    </html>
  );
}
