"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: number;
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "info";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, type = "default" }: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`px-5 py-3 rounded-xl shadow-lg border backdrop-blur-sm text-sm text-gray-800
                ${t.type === "success" ? "bg-green-50 border-green-300 text-green-800" : ""}
                ${t.type === "error" ? "bg-red-50 border-red-300 text-red-800" : ""}
                ${t.type === "info" ? "bg-blue-50 border-blue-300 text-blue-800" : ""}
                ${t.type === "default" ? "bg-white/80 border-gray-200" : ""}`}
            >
              {t.title && <p className="font-semibold">{t.title}</p>}
              {t.description && <p className="text-xs mt-1">{t.description}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
