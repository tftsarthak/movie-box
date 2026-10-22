import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getTrendingMovies,
  getGenres,
  discoverMovies,
  searchMovies,
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
} from "@/api/movieApi";

// ─── Query Key Factory ──────────────────────────────────────────────────────
export const movieKeys = {
  all: () => ["movies"],
  trending: (timeWindow) => [...movieKeys.all(), "trending", timeWindow],
  search: (query, page) => [...movieKeys.all(), "search", query, page],
  discover: (filters, page) => [...movieKeys.all(), "discover", filters, page],
  genres: () => [...movieKeys.all(), "genres"],
  detail: (tmdbId) => [...movieKeys.all(), "detail", String(tmdbId)],
  credits: (tmdbId) => [...movieKeys.all(), "credits", String(tmdbId)],
  similar: (tmdbId, page) => [...movieKeys.all(), "similar", String(tmdbId), page],
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

/**
 * Hook to search movies by text query with pagination.
 * Only enabled when query is non-empty.
 * Uses keepPreviousData for smooth page transitions.
 * @param {string} query
 * @param {number} page - 1-indexed, clamped to [1, 500]
 */
export const useSearchMovies = (query = "", page = 1) =>
  useQuery({
    queryKey: movieKeys.search(query?.trim(), page),
    queryFn: ({ signal }) => searchMovies(query.trim(), page, { signal }),
    enabled: Boolean(query?.trim()),
    placeholderData: keepPreviousData,
  });

/**
 * Hook to fetch detailed movie information by TMDB ID
 * @param {string|number} tmdbId
 */
export const useMovieDetails = (tmdbId) =>
  useQuery({
    queryKey: movieKeys.detail(tmdbId),
    queryFn: ({ signal }) => getMovieDetails(tmdbId, { signal }),
    enabled: Boolean(tmdbId && /^\d+$/.test(String(tmdbId))),
  });

/**
 * Hook to fetch cast and crew credits for a movie
 * @param {string|number} tmdbId
 */
export const useMovieCredits = (tmdbId) =>
  useQuery({
    queryKey: movieKeys.credits(tmdbId),
    queryFn: ({ signal }) => getMovieCredits(tmdbId, { signal }),
    enabled: Boolean(tmdbId && /^\d+$/.test(String(tmdbId))),
  });

/**
 * Hook to fetch similar movies recommendations
 * @param {string|number} tmdbId
 * @param {number} [page=1]
 */
export const useSimilarMovies = (tmdbId, page = 1) =>
  useQuery({
    queryKey: movieKeys.similar(tmdbId, page),
    queryFn: ({ signal }) => getSimilarMovies(tmdbId, page, { signal }),
    enabled: Boolean(tmdbId && /^\d+$/.test(String(tmdbId))),
    select: (data) => data?.results ?? [],
  });


