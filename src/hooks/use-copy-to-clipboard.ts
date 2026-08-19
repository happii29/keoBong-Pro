"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/toast";

type CopyState = {
  copied: boolean;
  copying: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
};

export function useCopyToClipboard(timeoutMs = 1600): CopyState {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { showToast } = useToast();

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      setCopying(true);

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast({
          tone: "success",
          title: "Đã copy",
          description: "Nội dung đã được đưa vào clipboard.",
        });

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
        showToast({
          tone: "error",
          title: "Không thể copy",
          description: "Trình duyệt chưa cho phép truy cập clipboard.",
        });
        return false;
      } finally {
        setCopying(false);
      }
    },
    [showToast, timeoutMs],
  );

  useEffect(() => reset, [reset]);

  return { copied, copying, copy, reset };
}
