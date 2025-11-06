"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SITE_CONFIG } from "@/constants/site";
import { ThemeToggleBtn } from "@/components/ui/theme-toggle-btn";
import { SidebarTrigger } from "@/components/ui/sidebar";

/* ----------------------------- User Menu ----------------------------- */
interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onItemClick?: (item: string) => void;
}

interface BrandProps {
  logo: React.ReactNode;
}

const UserMenu: React.FC<UserMenuProps> = React.memo(
  ({
    userName = "John Doe",
    userEmail = "john@example.com",
    userAvatar,
    onItemClick,
  }) => {
    const initials = React.useMemo(
      () =>
        userName
          .split(" ")
          .map((n) => n[0])
          .join(""),
      [userName]
    );

    const handleItemClick = (item: string) => () => onItemClick?.(item);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleItemClick("profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleItemClick("settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleItemClick("logout")}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
UserMenu.displayName = "UserMenu";

const Brand: React.FC<BrandProps> = ({ logo }) => (
  <div className="flex">
    <button
      onClick={(e) => e.preventDefault()}
      className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors"
    >
      <div className="text-2xl">{logo}</div>
      <span className="hidden font-semibold text-2xl sm:inline-block uppercase">
        {SITE_CONFIG.NAME}
      </span>
    </button>
  </div>
);

/* ----------------------------- Navbar ----------------------------- */
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  signInText?: string;
  ctaText?: string;
  dashboardLayout?: boolean;
  sidebar?: boolean;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
  onUserItemClick?: (item: string) => void;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      signInText = "Sign In",
      ctaText = "Get Started",
      dashboardLayout = false,
      sidebar = false,
      userName = "John Doe",
      userEmail = "john@example.com",
      userAvatar,
      onSignInClick,
      onCtaClick,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    const handleClick =
      (callback?: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        callback?.();
      };

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 **:no-underline",
          className
        )}
        {...props}
      >
        <div className="flex h-15 w-full items-center justify-between gap-4 md:pr-5 md:pl-2">
          {/* Left: Logo + Name */}
          {!dashboardLayout ? (
            <Brand logo={logo} />
          ) : sidebar ? (
            <SidebarTrigger className="cursor-pointer" />
          ) : (
            <Brand logo={logo} />
          )}

          {/* Right: Auth / CTA / User */}
          <div className="flex items-center gap-3">
            {!dashboardLayout ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={handleClick(onSignInClick)}
                >
                  {signInText}
                </Button>

                <Button
                  size="sm"
                  className="text-sm font-medium px-4 h-9 rounded-md shadow-sm cursor-pointer"
                  onClick={handleClick(onCtaClick)}
                >
                  {ctaText}
                </Button>
              </>
            ) : (
              <>
                <ThemeToggleBtn />
                <UserMenu
                  userName={userName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  onItemClick={onUserItemClick}
                />
              </>
            )}
          </div>
        </div>
      </header>
    );
  }
);

Navbar.displayName = "Navbar";
