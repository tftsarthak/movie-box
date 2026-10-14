import apiClient from "./axios";

/**
 * Fetch trending movies for a given time window (day or week)
 * @param {'day'|'week'} timeWindow
 * @param {number} page
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getTrendingMovies = async (timeWindow = "day", page = 1, options = {}) => {
  const res = await apiClient.get("/movies/trending", {
    params: { time_window: timeWindow, page },
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Search movies by text query
 * @param {string} query
 * @param {number} page
 * @param {{ signal?: AbortSignal }} [options]
 */
export const searchMovies = async (query, page = 1, options = {}) => {
  const res = await apiClient.get("/movies/search", {
    params: { query, page },
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Discover movies by genre, release year, or sort criteria
 * @param {{ genre?: string|number, year?: string|number, sortBy?: string }} filters
 * @param {number} page
 * @param {{ signal?: AbortSignal }} [options]
 */
export const discoverMovies = async ({ genre, year, sortBy } = {}, page = 1, options = {}) => {
  const params = { page };
  if (genre) params.genre = genre;
  if (year) params.year = year;
  if (sortBy) params.sort_by = sortBy;

  const res = await apiClient.get("/movies/discover", {
    params,
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Fetch available movie genres list
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getGenres = async (options = {}) => {
  const res = await apiClient.get("/movies/genres", {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Fetch detailed movie info by TMDB ID
 * @param {string|number} tmdbId
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMovieDetails = async (tmdbId, options = {}) => {
  const res = await apiClient.get(`/movies/${tmdbId}`, {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Fetch movie cast and crew credits
 * @param {string|number} tmdbId
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMovieCredits = async (tmdbId, options = {}) => {
  const res = await apiClient.get(`/movies/${tmdbId}/credits`, {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Fetch similar movies recommendation list
 * @param {string|number} tmdbId
 * @param {number} page
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getSimilarMovies = async (tmdbId, page = 1, options = {}) => {
  const res = await apiClient.get(`/movies/${tmdbId}/similar`, {
    params: { page },
    signal: options.signal,
  });
  return res.data ?? res;
};

