import HomePage from "@/pages/Home";
import DashboardPage from "@/pages/Dashboard";
import MutualFundsPage from "@/pages/MutualFunds";
import StocksPage from "@/pages/Stocks";
import ETFPage from "@/pages/ETF";
import DepositsPage from "@/pages/Deposits";
import TermDepositsPage from "@/pages/TermDeposits";
import IInitiateAccountSetupPage from "@/pages/InitiateAccountSetup";
import { ROUTES } from "./routes";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  isProtected?: boolean;
  redirectIfAuthenticated?: string;
  redirectIfNotAuthenticated?: string;
  useLayout?: boolean;
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
    useLayout: true,
  },
  {
    path: ROUTES.MUTUALFUNDS,
    component: MutualFundsPage,
    isProtected: true,
    useLayout: true,
  },
  {
    path: ROUTES.STOCKS,
    component: StocksPage,
    isProtected: true,
    useLayout: true,
  },
  {
    path: ROUTES.ETF,
    component: ETFPage,
    isProtected: true,
    useLayout: true,
  },
  {
    path: ROUTES.DEPOSITS,
    component: DepositsPage,
    isProtected: true,
    useLayout: true,
  },
  {
    path: ROUTES.TERM_DEPOSITS,
    component: TermDepositsPage,
    isProtected: true,
    useLayout: true,
  },
  {
    path: ROUTES.INITIATE_SETUP,
    component: IInitiateAccountSetupPage,
    isProtected: true,
  },
];
