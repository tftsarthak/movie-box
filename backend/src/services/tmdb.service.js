import tmdbFetch from "../api/tmdbFetch.js";

// ─── Movie Service Functions ──────────────────────────────────────────

export const fetchTrendingMovies = async (timeWindow = "day", page = 1) => {
    return tmdbFetch(`/trending/movie/${timeWindow}`, {
        params: { page },
    });
};

export const searchMovies = async (query, page = 1) => {
    return tmdbFetch("/search/movie", {
        params: { query, page },
    });
};

export const discoverMovies = async (filters = {}, page = 1) => {
    const params = { page };

    if (filters.genre) params.with_genres = filters.genre;
    if (filters.year) params.primary_release_year = filters.year;
    if (filters.sort_by) params.sort_by = filters.sort_by;

    return tmdbFetch("/discover/movie", { params });
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
    return tmdbFetch(`/movie/${tmdbId}/similar`, {
        params: { page },
    });
};

// ─── TMDB Auth & Session Service Functions ────────────────────────────

/**
 * Create a new temporary request token from TMDB v3 API.
 */
export const createRequestToken = async () => {
    return tmdbFetch("/authentication/token/new");
};

/**
 * Exchange an authorized request token for a TMDB session ID.
 */
export const createSession = async (requestToken) => {
    return tmdbFetch("/authentication/session/new", {
        method: "POST",
        data: { request_token: requestToken },
    });
};

/**
 * Fetch authenticated user's TMDB account details using session ID.
 */
export const fetchAccountDetails = async (sessionId) => {
    return tmdbFetch("/account", {
        params: { session_id: sessionId },
    });
};

/**
 * Invalidate an active session ID on TMDB servers.
 */
export const deleteSession = async (sessionId) => {
    return tmdbFetch("/authentication/session", {
        method: "DELETE",
        data: { session_id: sessionId },
    });
};

// ─── Favorites Service Functions ──────────────────────────────────────

/**
 * Fetch user's favorite movies.
 */
export const fetchFavoriteMovies = async (accountId, sessionId, page = 1, sortBy = "created_at.desc") => {
    return tmdbFetch(`/account/${accountId}/favorite/movies`, {
        params: {
            session_id: sessionId,
            page,
            sort_by: sortBy,
        },
    });
};

/**
 * Fetch user's favorite TV shows.
 */
export const fetchFavoriteTv = async (accountId, sessionId, page = 1, sortBy = "created_at.desc") => {
    return tmdbFetch(`/account/${accountId}/favorite/tv`, {
        params: {
            session_id: sessionId,
            page,
            sort_by: sortBy,
        },
    });
};

/**
 * Add or remove an item from user's favorites list.
 */
export const updateFavorite = async (accountId, sessionId, { mediaType, mediaId, favorite }) => {
    return tmdbFetch(`/account/${accountId}/favorite`, {
        method: "POST",
        params: { session_id: sessionId },
        data: {
            media_type: mediaType,
            media_id: Number(mediaId),
            favorite: Boolean(favorite),
        },
    });
};

// ─── Watchlist Service Functions ──────────────────────────────────────

/**
 * Fetch user's watchlist movies.
 */
export const fetchWatchlistMovies = async (accountId, sessionId, page = 1, sortBy = "created_at.desc") => {
    return tmdbFetch(`/account/${accountId}/watchlist/movies`, {
        params: {
            session_id: sessionId,
            page,
            sort_by: sortBy,
        },
    });
};

/**
 * Fetch user's watchlist TV shows.
 */
export const fetchWatchlistTv = async (accountId, sessionId, page = 1, sortBy = "created_at.desc") => {
    return tmdbFetch(`/account/${accountId}/watchlist/tv`, {
        params: {
            session_id: sessionId,
            page,
            sort_by: sortBy,
        },
    });
};

/**
 * Add or remove an item from user's watchlist.
 */
export const updateWatchlist = async (accountId, sessionId, { mediaType, mediaId, watchlist }) => {
    return tmdbFetch(`/account/${accountId}/watchlist`, {
        method: "POST",
        params: { session_id: sessionId },
        data: {
            media_type: mediaType,
            media_id: Number(mediaId),
            watchlist: Boolean(watchlist),
        },
    });
};

// ─── Personal Account States Service Functions ────────────────────────

/**
 * Get account states (favorite, watchlist, rating) for a movie.
 */
export const fetchMovieAccountStates = async (movieId, sessionId) => {
    return tmdbFetch(`/movie/${movieId}/account_states`, {
        params: { session_id: sessionId },
    });
};

/**
 * Get account states (favorite, watchlist, rating) for a TV show.
 */
export const fetchTvAccountStates = async (seriesId, sessionId) => {
    return tmdbFetch(`/tv/${seriesId}/account_states`, {
        params: { session_id: sessionId },
    });
};

/**
 * Get account states (rating) for a TV episode.
 */
export const fetchEpisodeAccountStates = async (seriesId, seasonNumber, episodeNumber, sessionId) => {
    return tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/account_states`, {
        params: { session_id: sessionId },
    });
};
