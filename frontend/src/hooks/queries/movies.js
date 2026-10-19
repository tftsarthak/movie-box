import { useQuery } from "@tanstack/react-query";
import { getTrendingMovies } from "@/api/movieApi";

// ─── Query Key Factory ──────────────────────────────────────────────────────
export const movieKeys = {
  all: () => ["movies"],
  trending: (timeWindow) => [...movieKeys.all(), "trending", timeWindow],
  search: (query, page) => [...movieKeys.all(), "search", query, page],
  discover: (filters, page) => [...movieKeys.all(), "discover", filters, page],
  genres: () => [...movieKeys.all(), "genres"],
  detail: (tmdbId) => [...movieKeys.all(), "detail", tmdbId],
  credits: (tmdbId) => [...movieKeys.all(), "credits", tmdbId],
  similar: (tmdbId, page) => [...movieKeys.all(), "similar", tmdbId, page],
};

// ─── Queries ────────────────────────────────────────────────────────────────
/**
 * Hook to fetch trending movies for day or week
 * @param {'day'|'week'} timeWindow
 */
export const useTrendingMovies = (timeWindow = "day") =>
  useQuery({
    queryKey: movieKeys.trending(timeWindow),
    queryFn: ({ signal }) => getTrendingMovies(timeWindow, 1, { signal }),
    select: (data) => data?.results ?? [],
  });
