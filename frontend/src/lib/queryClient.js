import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 15 * 60 * 1000, // 15 min garbage collection
      retry: (failureCount, error) => {
        // Don't retry 4xx client errors (auth failures, not-found)
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // TMDB data doesn't need aggressive refetching
    },
    mutations: {
      retry: false, // mutations should not auto-retry
    },
  },
});
