"use client";

import { useFormStatus } from "react-dom";
import type * as React from "react";

import { Button } from "@/components/ui/button";

type PendingSubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingText: React.ReactNode;
};

export function PendingSubmitButton({
  children,
  disabled,
  pendingText,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      loading={pending}
      loadingText={pendingText}
    >
      {children}
    </Button>
  );
}
