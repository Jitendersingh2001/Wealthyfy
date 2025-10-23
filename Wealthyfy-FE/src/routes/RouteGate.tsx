import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/routes/routes";

interface RouteGateProps {
  children: React.ReactNode;
  isProtected?: boolean;       // true = needs authentication
  redirectIfAuthenticated?: string; // where to go if already logged in
  redirectIfNotAuthenticated?: string; // where to go if not logged in
}

const RouteGate: React.FC<RouteGateProps> = ({
  children,
  isProtected = false,
  redirectIfAuthenticated = ROUTES.DASHBOARD,
  redirectIfNotAuthenticated = ROUTES.HOME,
}) => {
    const { isAuthenticated } = useAuth();
    
  if (isProtected && !isAuthenticated) {
    // Protected route, user not logged in
    return <Navigate to={redirectIfNotAuthenticated} replace />;
  }

  if (!isProtected && isAuthenticated) {
    // Public route, user logged in
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  return <>{children}</>;
};

export default RouteGate;
