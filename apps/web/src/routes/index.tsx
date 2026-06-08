import { createRoute } from "@tanstack/react-router";

import { StatusPage } from "@/components/status-page";

import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: StatusPage,
});
