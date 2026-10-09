import tmdbFetch from "../api/tmdbFetch.js"

// ─── Movie Service Functions ──────────────────────────────────────────

export const fetchTrendingMovies = async (timeWindow = "day", page = 1) => {
    return tmdbFetch(`/trending/movie/${timeWindow}`, { page });
};

export const searchMovies = async (query, page = 1) => {
    return tmdbFetch("/search/movie", { query, page });
};

export const discoverMovies = async (filters = {}, page = 1) => {
    const params = { page };

    if (filters.genre) params.with_genres = filters.genre;
    if (filters.year) params.primary_release_year = filters.year;
    if (filters.sort_by) params.sort_by = filters.sort_by;

    return tmdbFetch("/discover/movie", params);
};

export const fetchGenres = async () => {
    return tmdbFetch("/genre/movie/list");
};

export const fetchMovieDetails = async (tmdbId) => {
    return tmdbFetch(`/movie/${tmdbId}`);
};

export const fetchMovieCredits = async (tmdbId) => {
    return tmdbFetch(`/movie/${tmdbId}/credits`);
};

export const fetchSimilarMovies = async (tmdbId, page = 1) => {
    return tmdbFetch(`/movie/${tmdbId}/similar`, { page });
};

// ─── TMDB Auth & Session Service Functions ────────────────────────────

/**
 * Create a new request token from TMDB v3 API.
 */
export const createRequestToken = async () => {
    return tmdbFetch("/authentication/token/new");
};

/**
 * Exchange an authorized request token for a TMDB session ID.
 */
export const createSession = async (requestToken) => {
    try {
        const { data } = await tmdbClient.post("/authentication/session/new", {
            request_token: requestToken,
        });
        return data;
    } catch (error) {
        handleTmdbError(error, "Failed to create TMDB session");
    }
};

/**
 * Fetch authenticated user's TMDB account details using session ID.
 */
export const fetchAccountDetails = async (sessionId) => {
    return tmdbFetch("/account", { session_id: sessionId });
};

/**
 * Invalidate an active session ID on TMDB servers.
 */
export const deleteSession = async (sessionId) => {
    try {
        const { data } = await tmdbClient.delete("/authentication/session", {
            data: { session_id: sessionId },
        });
        return data;
    } catch (error) {
        handleTmdbError(error, "Failed to delete TMDB session");
    }
};
