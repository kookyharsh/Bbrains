"use client";

import * as React from "react";

export type UiMode = "classic" | "new";

type UiModeContextValue = {
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
  toggleUiMode: () => void;
};

const UI_MODE_STORAGE_KEY = "bb-ui-mode";

const UiModeContext = React.createContext<UiModeContextValue | null>(null);

function persistUiMode(mode: UiMode) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(UI_MODE_STORAGE_KEY, mode);
  document.documentElement.dataset.uiMode = mode;
  document.cookie = `ui-mode=${mode}; path=/; max-age=31536000; samesite=lax`;
}

export function UiModeProvider({
  children,
  initialMode = "classic",
}: {
  children: React.ReactNode;
  initialMode?: UiMode;
}) {
  const [uiMode, setUiModeState] = React.useState<UiMode>(initialMode);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    persistUiMode(uiMode);
  }, [uiMode]);

  const setUiMode = React.useCallback((mode: UiMode) => {
    setUiModeState(mode);
    persistUiMode(mode);
  }, []);

  const toggleUiMode = React.useCallback(() => {
    setUiMode(uiMode === "new" ? "classic" : "new");
  }, [setUiMode, uiMode]);

  const value = React.useMemo(
    () => ({
      uiMode,
      setUiMode,
      toggleUiMode,
    }),
    [setUiMode, toggleUiMode, uiMode]
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode() {
  const context = React.useContext(UiModeContext);

  if (!context) {
    throw new Error("useUiMode must be used within a UiModeProvider");
  }

  return context;
}
