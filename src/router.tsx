import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Reloads should always start at the top of the page; restoring a stale
    // scroll offset before async sections finish rendering lands the user
    // in the middle of the page.
    scrollRestoration: false,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
