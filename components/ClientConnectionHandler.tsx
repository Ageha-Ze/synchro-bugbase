"use client";

import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { XCircle } from "lucide-react";

// Context untuk status koneksi
const ConnectionContext = createContext({ online: true });

export const useConnection = () => useContext(ConnectionContext);

interface ClientConnectionHandlerProps {
  children: ReactNode;
}

export default function ClientConnectionHandler({ children }: ClientConnectionHandlerProps) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cek status awal
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ online }}>
      {children}
      {!online && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <XCircle className="mx-auto mb-4 w-12 h-12 text-red-600" />
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              No Internet Connection
            </p>
            <p className="text-sm text-gray-500">
              You cannot perform actions while offline.
            </p>
          </div>
        </div>
      )}
    </ConnectionContext.Provider>
  );
}
