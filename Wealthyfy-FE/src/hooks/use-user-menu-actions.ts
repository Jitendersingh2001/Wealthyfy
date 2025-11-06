import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function useUserMenuActions() {
  const auth = useAuth();
  const navigate = useNavigate();

  return (item: string) => {
    const actions: Record<string, () => void> = {
      logout: auth.logout,
      profile: () => navigate("/profile"),
      settings: () => navigate("/settings"),
    };

    const action = actions[item];
    if (action) action();
  };
}
