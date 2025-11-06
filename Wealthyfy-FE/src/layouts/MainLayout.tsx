"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

// Utility function to read sidebar state from cookie
function getSidebarStateFromCookie(): boolean {
  if (typeof document === "undefined") return true;
  
  const cookies = document.cookie.split(';');
  const sidebarCookie = cookies.find(cookie => 
    cookie.trim().startsWith('sidebar_state=')
  );
  
  if (sidebarCookie) {
    const value = sidebarCookie.split('=')[1];
    return value === 'true';
  }
  
  return true; // default to open
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => getSidebarStateFromCookie());

  // Restore user's original theme preference
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

  const handleUserItemClick = (item: string) => {
    const actions: Record<string, () => void> = {
      logout: auth.logout,
      profile: () => navigate("/profile"),
      settings: () => navigate("/settings"),
    };
    actions[item]?.();
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" variant="sidebar">
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <Navbar
            dashboardLayout={auth.isAuthenticated}
            userName={auth.user?.fullName}
            userEmail={auth.user?.email}
            onUserItemClick={handleUserItemClick}
            sidebar= {true}
          />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default MainLayout;