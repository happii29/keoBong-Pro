"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

import { themeConfig } from "@/config/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={themeConfig.defaultTheme}
      enableSystem
      disableTransitionOnChange
      storageKey={themeConfig.storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
