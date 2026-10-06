import { ApiError } from "../utils/ApiError.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Internal helper — all TMDB HTTP requests go through here.
 * Attaches the Bearer token, builds the URL, and maps TMDB errors to ApiError.
 */
const tmdbFetch = async (path, params = {}) => {
    if (!process.env.TMDB_ACCESS_TOKEN) {
        throw new ApiError(500, "TMDB configuration error");
    }

    const url = new URL(`${TMDB_BASE_URL}${path}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    });

    let response;
    try {
        response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
    } catch {
        throw new ApiError(502, "Failed to reach TMDB");
    }

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));

        if (response.status === 404) {
            throw new ApiError(404, "Movie not found");
        }
        if (response.status === 401) {
            throw new ApiError(502, "TMDB authentication error");
        }
        if (response.status === 429) {
            throw new ApiError(503, "Service temporarily unavailable");
        }

        throw new ApiError(502, body.status_message || "TMDB request failed");
    }

    return response.json();
};

// ─── Exported service functions ──────────────────────────────────────

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
