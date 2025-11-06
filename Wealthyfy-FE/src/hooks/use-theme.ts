import { useContext, useEffect } from "react";
import { ThemeProviderContext } from "@/components/ui/theme-provider";

export const useTheme = (restorePreference = false) => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  const { setTheme } = context;

  // Optional logic to restore stored theme
  useEffect(() => {
    if (!restorePreference) return;

    const stored = localStorage.getItem("user-theme-preference") as
      | "light"
      | "dark"
      | "system"
      | null;

    if (stored && stored !== "light") {
      setTheme(stored);
      localStorage.removeItem("user-theme-preference");
    }
  }, [restorePreference, setTheme]);

  return context;
};
