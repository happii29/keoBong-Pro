"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      window.setTimeout(() => removeToast(id), toast.tone === "error" ? 5200 : 3200);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] grid w-[calc(100vw-2rem)] max-w-sm gap-3">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const Icon = toast.tone === "success" ? CheckCircle2 : XCircle;

  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "premium-card grid grid-cols-[auto_1fr] gap-3 p-4 text-left shadow-luxury transition hover:-translate-y-0.5",
        toast.tone === "success" ? "border-emerald/30" : "border-destructive/35",
      )}
    >
      <div
        className={cn(
          "grid size-9 place-items-center rounded-md border",
          toast.tone === "success"
            ? "border-emerald/25 bg-emerald/12 text-emerald"
            : "border-destructive/25 bg-destructive/12 text-destructive",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold">{toast.title}</p>
        {toast.description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{toast.description}</p> : null}
      </div>
    </button>
  );
}
