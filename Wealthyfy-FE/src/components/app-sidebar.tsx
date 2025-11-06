"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SITE_CONFIG } from "@/constants/site";
import Logo from "@/components/ui/logo";
import {
  SidebarHeader,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Handshake } from "lucide-react";
import { ROUTES } from "@/routes/routes";
import { Link } from "react-router-dom";


// Menu items with routes and icons
const MENU_ITEMS = [
  { title: "Dashboard", url: ROUTES.DASHBOARD, icon: Home, description: "Overview and analytics" },
  { title: "Mutual Funds", url: ROUTES.MUTUALFUNDS, icon: Handshake, description: "Mutual Funds OverView" },
];

function SidebarHeaderContent() {
  const { state } = useSidebar();

  return (
    <div className="text-primary flex items-center gap-3 py-2 group/header">
      <div className="text-2xl transition-transform duration-200 group-hover/header:scale-105">
        <Logo />
      </div>
      {state === "expanded" && (
        <span className="text-2xl font-semibold uppercase tracking-wide transition-all duration-200 group-hover/header:text-primary/90">{SITE_CONFIG.NAME}</span>
      )}
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>("");

  // Update active menu item based on current path
  useEffect(() => {
    const activeMenu = MENU_ITEMS.find(item => item.url === location.pathname);
    setActiveItem(activeMenu?.title || "");
  }, [location.pathname]);

const renderMenuItem = (item: typeof MENU_ITEMS[0]) => {
  const isActive = activeItem === item.title;

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.description}
        className="group relative"
      >
        <Link
          to={item.url}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 hover:bg-accent/40 hover:scale-[1.01] focus:outline-none focus:ring-1 focus:ring-accent/30 cursor-pointer group-hover:shadow-sm"
          aria-label={`Navigate to ${item.title}`}
          role="menuitem"
          tabIndex={0}
        >
          <item.icon
            className={`transition-all duration-200 group-hover:scale-105 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-base transition-all duration-200 ${
              isActive ? "text-primary font-medium" : "text-foreground"
            }`}
          >
            {item.title}
          </span>

          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full shadow-sm" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};


  return (
    <>
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="pt-4 space-y-1 group/menu">
              {MENU_ITEMS.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
