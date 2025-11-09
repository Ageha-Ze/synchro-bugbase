// components/ConnectionHandler.tsx
"use client";

import { useState, useEffect } from "react";

interface ConnectionHandlerProps {
  children: React.ReactNode;
}

export default function ConnectionHandler({ children }: ConnectionHandlerProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Cek awal
    updateOnlineStatus();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <div className="relative">
      {/* Konten menu */}
      <div style={{ pointerEvents: isOnline ? "auto" : "none", opacity: isOnline ? 1 : 0.5 }}>
        {children}
      </div>

      {/* Modal alert */}
      {!isOnline && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              ⚠ No Internet Connection
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You are offline. Please check your internet connection to continue using this menu.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
