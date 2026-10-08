import apiClient from "./axios";

/**
 * Fetch trending movies for a given time window (day or week)
 * @param {'day'|'week'} timeWindow
 * @param {number} page
 */
export const getTrendingMovies = async (timeWindow = "day", page = 1) => {
  const res = await apiClient.get("/movies/trending", {
    params: { time_window: timeWindow, page },
  });
  return res.data ?? res;
};

/**
 * Search movies by text query
 * @param {string} query
 * @param {number} page
 */
export const searchMovies = async (query, page = 1) => {
  const res = await apiClient.get("/movies/search", {
    params: { query, page },
  });
  return res.data ?? res;
};

/**
 * Discover movies by genre, release year, or sort criteria
 * @param {{ genre?: string|number, year?: string|number, sortBy?: string }} filters
 * @param {number} page
 */
export const discoverMovies = async ({ genre, year, sortBy } = {}, page = 1) => {
  const params = { page };
  if (genre) params.genre = genre;
  if (year) params.year = year;
  if (sortBy) params.sort_by = sortBy;

  const res = await apiClient.get("/movies/discover", { params });
  return res.data ?? res;
};

/**
 * Fetch available movie genres list
 */
export const getGenres = async () => {
  const res = await apiClient.get("/movies/genres");
  return res.data ?? res;
};

/**
 * Fetch detailed movie info by TMDB ID
 * @param {string|number} tmdbId
 */
export const getMovieDetails = async (tmdbId) => {
  const res = await apiClient.get(`/movies/${tmdbId}`);
  return res.data ?? res;
};

/**
 * Fetch movie cast and crew credits
 * @param {string|number} tmdbId
 */
export const getMovieCredits = async (tmdbId) => {
  const res = await apiClient.get(`/movies/${tmdbId}/credits`);
  return res.data ?? res;
};

/**
 * Fetch similar movies recommendation list
 * @param {string|number} tmdbId
 * @param {number} page
 */
export const getSimilarMovies = async (tmdbId, page = 1) => {
  const res = await apiClient.get(`/movies/${tmdbId}/similar`, {
    params: { page },
  });
  return res.data ?? res;
};
