import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useUserMenuActions } from "@/hooks/use-user-menu-actions";
import { useRestoreThemePreference } from "@/hooks/use-restore-theme";

function InitiateSetup() {
  const auth = useAuth();
  const handleUserItemClick = useUserMenuActions();
  useRestoreThemePreference();
  return (
    <>
      <Navbar
        dashboardLayout={auth.isAuthenticated}
        userName={auth.user?.fullName}
        userEmail={auth.user?.email}
        onUserItemClick={handleUserItemClick}
        isInitateSetup={true}
      />
    </>
  );
}

export default InitiateSetup;
