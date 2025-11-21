import {
  PieChart,
  LineChart,
  TrendingUp,
  Banknote,
  CalendarClock,
  LayoutDashboard,
} from "lucide-react";
import { ROUTES } from "@/routes/routes";

// Menu item type
export type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

// Menu items categorized
export const MENU_CATEGORIES = {
  Overview: [
    {
      title: "Dashboard",
      url: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
  ] as MenuItem[],
  Investment: [
    {
      title: "Mutual Funds",
      url: ROUTES.MUTUALFUNDS,
      icon: PieChart,
      description: "Mutual Funds Overview",
    },
    {
      title: "Stocks",
      url: ROUTES.STOCKS,
      icon: LineChart,
      description: "Stocks Overview",
    },
    {
      title: "ETF",
      url: ROUTES.ETF,
      icon: TrendingUp,
      description: "Exchange Traded Funds Overview",
    },
  ] as MenuItem[],
  Banking: [
    {
      title: "Deposits",
      url: ROUTES.DEPOSITS,
      icon: Banknote,
      description: "Deposit Overview",
    },
    {
      title: "Term Deposits",
      url: ROUTES.TERM_DEPOSITS,
      icon: CalendarClock,
      description: "Term Deposits Overview",
    },
  ] as MenuItem[],
};

// Flatten all menu items for active item detection
export const ALL_MENU_ITEMS = [
  ...MENU_CATEGORIES.Overview,
  ...MENU_CATEGORIES.Investment,
  ...MENU_CATEGORIES.Banking,
];

