"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const fallbackTimeout = useRef<number | null>(null);
  const search = searchParams.toString();

  useEffect(() => {
    const clearFallback = () => {
      if (fallbackTimeout.current) {
        window.clearTimeout(fallbackTimeout.current);
        fallbackTimeout.current = null;
      }
    };

    clearFallback();
    const settleTimeout = window.setTimeout(() => setLoading(false), 120);

    return () => {
      window.clearTimeout(settleTimeout);
      clearFallback();
    };
  }, [pathname, search]);

  useEffect(() => {
    const startLoading = () => {
      setLoading(true);

      if (fallbackTimeout.current) {
        window.clearTimeout(fallbackTimeout.current);
      }

      fallbackTimeout.current = window.setTimeout(() => {
        setLoading(false);
        fallbackTimeout.current = null;
      }, 12000);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) {
        return;
      }

      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
        return;
      }

      startLoading();
    };

    window.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("click", handleClick, { capture: true });

      if (fallbackTimeout.current) {
        window.clearTimeout(fallbackTimeout.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-x-0 top-0 z-[90] h-1 origin-left bg-gradient-to-r from-emerald via-gold to-emerald shadow-gold transition-all duration-300",
        loading ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
      )}
    />
  );
}
