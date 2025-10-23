import RouteGate from "./RouteGate";
import { routesConfig, type RouteConfig } from "@/routes/RouteConfig";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
}

export const appRoutes: AppRoute[] = routesConfig.map((route: RouteConfig) => ({
  path: route.path,
  element: (
    <RouteGate
      isProtected={!!route.isProtected}
      redirectIfAuthenticated={route.redirectIfAuthenticated}
      redirectIfNotAuthenticated={route.redirectIfNotAuthenticated}
    >
      <route.component />
    </RouteGate>
  )
}));
