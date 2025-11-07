import { useEffect } from "react";

/**
 * Prevents navigation using the browser's back button.
 * Designed for multi-step flows (e.g., onboarding).
 */
export function useBlockBackNavigation() {
  useEffect(() => {
    // Push the current state so back button has no previous entry
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Re-push state when back is triggered
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
