"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useLocation, Link } from "react-router-dom";
import { SITE_CONFIG } from "@/constants/site";
import Logo from "@/components/ui/logo";
import {
  SidebarHeader,
  useSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  MENU_CATEGORIES,
  ALL_MENU_ITEMS,
  type MenuItem,
} from "@/constants/menuItems";

// -------------------------------------------------------
// Header Component
// -------------------------------------------------------
function SidebarHeaderContent() {
  const { state } = useSidebar();

  return (
    <div className="text-primary flex items-center gap-3 py-2 group/header">
      <div className="text-2xl transition-transform duration-200 group-hover/header:scale-105">
        <Logo />
      </div>

      {state === "expanded" && (
        <span className="text-2xl font-semibold uppercase tracking-wide transition-all duration-200 group-hover/header:text-primary/90">
          {SITE_CONFIG.NAME}
        </span>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Main Sidebar
// -------------------------------------------------------
export function AppSidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");
  const { state } = useSidebar();

  // Determine the active menu item when route changes
  useEffect(() => {
    const activeMenu = ALL_MENU_ITEMS.find(
      (item) => item.url === location.pathname
    );
    setActiveItem(activeMenu?.title || "");
  }, [location.pathname]);

  // Memoized menu renderer for performance and clean JSX
  const renderMenuItem = useCallback(
    (item: MenuItem) => {
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
              className="w-full flex items-center gap-3 px-3 py-5 rounded-md transition-all duration-200 hover:bg-accent/40 hover:scale-[1.01] focus:outline-none focus:ring-1 focus:ring-accent/30"
              aria-label={`Navigate to ${item.title}`}
              role="menuitem"
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-9 bg-primary rounded-full" />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    },
    [activeItem]
  );

  // Generic Renderer for each category block
  const renderCategory = (label: string, items: MenuItem[]) => (
    <SidebarGroup key={label}>
      {state === "expanded" && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">{items.map(renderMenuItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Fragment>
      <SidebarHeader>
        <SidebarHeaderContent />
      </SidebarHeader>

      <SidebarContent>
        {renderCategory("Overview", MENU_CATEGORIES.Overview)}
        {renderCategory("Banking", MENU_CATEGORIES.Banking)}
        {renderCategory("Investment", MENU_CATEGORIES.Investment)}
      </SidebarContent>
    </Fragment>
  );
}
