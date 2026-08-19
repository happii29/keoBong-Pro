"use client";

import { useEffect, useRef } from "react";

import { useToast } from "@/components/ui/toast";

type ActionState = {
  error?: string;
  message?: string;
};

export function useActionFeedback(
  state: ActionState,
  pending: boolean,
  options?: {
    successTitle?: string;
    errorTitle?: string;
    onSuccess?: () => void;
  },
) {
  const { showToast } = useToast();
  const previousPending = useRef(false);
  const lastMessage = useRef<string | undefined>(undefined);
  const lastError = useRef<string | undefined>(undefined);

  useEffect(() => {
    const actionSettled = previousPending.current && !pending;

    if (state.error && (actionSettled || state.error !== lastError.current)) {
      lastError.current = state.error;
      showToast({
        tone: "error",
        title: options?.errorTitle ?? "Không thể lưu thay đổi",
        description: state.error,
      });
    }

    if (state.message && (actionSettled || state.message !== lastMessage.current)) {
      lastMessage.current = state.message;
      showToast({
        tone: "success",
        title: options?.successTitle ?? "Đã lưu thành công",
        description: state.message,
      });
      options?.onSuccess?.();
    }

    previousPending.current = pending;
  }, [options, pending, showToast, state.error, state.message]);
}
