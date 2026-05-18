"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
};

export function useCopyToClipboard(timeoutMs = 1600): CopyState {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, timeoutMs);

        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeoutMs],
  );

  useEffect(() => reset, [reset]);

  return { copied, copy, reset };
}
