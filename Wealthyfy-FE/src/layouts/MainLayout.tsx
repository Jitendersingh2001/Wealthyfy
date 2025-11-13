"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useUserMenuActions } from "@/hooks/use-user-menu-actions";
import { useTheme } from "@/hooks/use-theme";

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
  useTheme(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => getSidebarStateFromCookie());
  const handleUserItemClick = useUserMenuActions();

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