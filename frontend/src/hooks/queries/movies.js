import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingMovies, getGenres, discoverMovies } from "@/api/movieApi";

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

/**
 * Hook to fetch the static genre list from TMDB.
 * Cached with staleTime: Infinity since genres rarely change.
 */
export const useMovieGenres = () =>
  useQuery({
    queryKey: movieKeys.genres(),
    queryFn: ({ signal }) => getGenres({ signal }),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24h
    select: (data) => data?.genres ?? [],
  });

/**
 * Hook to discover movies with optional filters and pagination.
 * Uses keepPreviousData to prevent layout flash during page transitions.
 * @param {{ genre?: string, year?: string, sortBy?: string }} filters
 * @param {number} page - 1-indexed, clamped to [1, 500]
 */
export const useDiscoverMovies = (filters = {}, page = 1) =>
  useQuery({
    queryKey: movieKeys.discover(filters, page),
    queryFn: ({ signal }) => discoverMovies(filters, page, { signal }),
    placeholderData: keepPreviousData,
  });
