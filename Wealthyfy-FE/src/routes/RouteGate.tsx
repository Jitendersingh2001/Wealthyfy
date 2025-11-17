import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSetuCallback } from "@/hooks/use-setu-callback";
import { ROUTES } from "@/routes/routes";

interface RouteGateProps {
  children: React.ReactNode;
  isProtected?: boolean;
  redirectIfAuthenticated?: string;
  redirectIfNotAuthenticated?: string;
}

const RouteGate: React.FC<RouteGateProps> = ({
  children,
  isProtected = false,
  redirectIfAuthenticated = ROUTES.DASHBOARD,
  redirectIfNotAuthenticated = ROUTES.HOME,
}) => {
  const { isAuthenticated, isSetupComplete } = useAuth();
  const location = useLocation();
  const isInitiateSetupRoute = location.pathname === ROUTES.INITIATE_SETUP;

  // Use Setu callback hook to handle redirects (before any other redirects)
  const { shouldRedirect, redirectPath } = useSetuCallback(undefined, location.pathname);

  // If Setu callback params are present and we're not already on initiate-setup, redirect there with params
  if (shouldRedirect && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // 1. Protected route but user not logged in
  if (isProtected && !isAuthenticated) {
    return <Navigate to={redirectIfNotAuthenticated} replace />;
  }

  // 2. User logged in but setup not complete and not currently on setup page
  if (isAuthenticated && !isSetupComplete && !isInitiateSetupRoute) {
    return <Navigate to={ROUTES.INITIATE_SETUP} replace />;
  }

  // 3. User logged in and setup complete but trying to access setup page
  if (isAuthenticated && isSetupComplete && isInitiateSetupRoute) {
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  // 4. Public route but user already logged in
  if (!isProtected && isAuthenticated) {
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  return <>{children}</>;
};

export default RouteGate;
