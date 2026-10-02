import { createBrowserRouter } from "react-router";
import { RequireAuth, RedirectIfAuthed } from "@/components/app/guards";
import { RouteError } from "@/components/app/route-error";

const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: "/", lazy: page(() => import("@/pages/landing")) },
      {
        lazy: page(() => import("@/layouts/auth-layout")),
        children: [
          { path: "/sign-in", element: <RedirectIfAuthed />, children: [{ index: true, lazy: page(() => import("@/pages/sign-in")) }] },
          { path: "/sign-up", element: <RedirectIfAuthed />, children: [{ index: true, lazy: page(() => import("@/pages/sign-up")) }] },
        ],
      },
      {
        path: "/onboarding",
        element: <RequireAuth allowUnonboarded />,
        children: [{ index: true, lazy: page(() => import("@/pages/onboarding")) }],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            lazy: page(() => import("@/layouts/app-layout")),
            children: [
              { path: "/dashboard", lazy: page(() => import("@/pages/dashboard")) },
              { path: "/resumes", lazy: page(() => import("@/pages/resumes")) },
              { path: "/templates", lazy: page(() => import("@/pages/templates")) },
              { path: "/settings", lazy: page(() => import("@/pages/settings")) },
            ],
          },
          { path: "/resumes/:id/edit", lazy: page(() => import("@/pages/editor")) },
        ],
      },
      { path: "/print/:id", lazy: page(() => import("@/pages/print")) },
      { path: "*", lazy: page(() => import("@/pages/not-found")) },
    ],
  },
]);
