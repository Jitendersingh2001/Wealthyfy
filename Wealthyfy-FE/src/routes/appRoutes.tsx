// src/routes/AppRoutes.tsx
import RouteGate from "./RouteGate";
import { routesConfig, type RouteConfig } from "@/routes/RouteConfig";
import MainLayout from "@/layouts/MainLayout";

export interface AppRoute {
  path: string;
  element: React.ReactNode;
}

export const appRoutes: AppRoute[] = routesConfig.map((route: RouteConfig) => {
   const content = route.useLayout
    ? (
        <MainLayout>
          <route.component />
        </MainLayout>
      )
    : <route.component />;

  return {
    path: route.path,
    element: (
      <RouteGate
        isProtected={!!route.isProtected}
        redirectIfAuthenticated={route.redirectIfAuthenticated}
        redirectIfNotAuthenticated={route.redirectIfNotAuthenticated}
      >
        {content}
      </RouteGate>
    ),
  };
});
