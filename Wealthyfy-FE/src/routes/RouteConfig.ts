import HomePage from "@/pages/Home";
import DashboardPage from "@/pages/Dashboard";
import MutualFundsPage from "@/pages/MutualFunds";
import { ROUTES } from "./routes";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  isProtected?: boolean;
  redirectIfAuthenticated?: string;
  redirectIfNotAuthenticated?: string;
}

export const routesConfig: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    component: HomePage,
  },
  {
    path: ROUTES.KEYCLOAKCALLBACK,
    component: HomePage,
  },
  {
    path: ROUTES.DASHBOARD,
    component: DashboardPage,
    isProtected: true,
  },
  {
    path: ROUTES.MUTUALFUNDS,
    component: MutualFundsPage,
    isProtected: true,
  },
];
