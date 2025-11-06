import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

function InitiateSetup() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleUserItemClick = (item: string) => {
    const actions: Record<string, () => void> = {
      logout: auth.logout,
      profile: () => navigate("/profile"),
      settings: () => navigate("/settings"),
    };
    actions[item]?.();
  };
  return (
    <>
      <Navbar
        dashboardLayout={auth.isAuthenticated}
        userName={auth.user?.fullName}
        userEmail={auth.user?.email}
        onUserItemClick={handleUserItemClick}
      />
    </>
  );
}

export default InitiateSetup;
