import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export function useRestoreThemePreference() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("user-theme-preference") as
      | "light"
      | "dark"
      | "system"
      | null;

    if (stored && stored !== "light") {
      setTheme(stored);
      localStorage.removeItem("user-theme-preference");
    }
  }, [setTheme]);
}
