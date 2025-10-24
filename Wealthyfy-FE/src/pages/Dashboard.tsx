import { useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

function DashboardPage() {
  const auth = useAuth();
  const { setTheme } = useTheme();

  // Restore user's original theme preference on mount
  useEffect(() => {
    const themePref = localStorage.getItem("user-theme-preference") as
      | "light"
      | "dark"
      | "system"
      | null;

    if (themePref && themePref !== "light") {
      setTheme(themePref);
      localStorage.removeItem("user-theme-preference");
    }
  }, [setTheme]);

  // Handle user menu actions
  const handleUserItemClick = (item: string) => {
    const actions: Record<string, () => void> = {
      logout: auth.logout,
      profile: () => console.log("Navigate to profile page"),
      settings: () => console.log("Navigate to settings page"),
    };

    actions[item]?.();
  };

  return (
    <div className="relative w-full">
      <Navbar
        dashboardLayout={auth.isAuthenticated}
        userName={auth.user?.fullName}
        userEmail={auth.user?.email}
        onUserItemClick={handleUserItemClick}
      />
    </div>
  );
}

export default DashboardPage;
