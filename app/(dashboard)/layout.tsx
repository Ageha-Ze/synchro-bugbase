// app/(dashboard)/layout.tsx
'use client';
import ProtectedRoute from '@/lib/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
