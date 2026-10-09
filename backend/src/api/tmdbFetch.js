import { ApiError } from "../utils/ApiError.js";
import tmdbClient from "../api/tmdbClient.js";

/**
 * Common error handler for TMDB API requests.
 * Maps TMDB axios errors to ApiError.
 */
const handleTmdbError = (error, defaultMessage = "TMDB request failed", path = "") => {
    if (error instanceof ApiError) {
        throw error;
    }

    if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
            throw new ApiError(404, path.includes("/movie") ? "Movie not found" : "Resource not found");
        }
        if (status === 401) throw new ApiError(502, "TMDB authentication error");
        if (status === 429) throw new ApiError(503, "Service temporarily unavailable");

        throw new ApiError(502, data?.status_message || defaultMessage);
    }

    console.error("TMDB network error:", error.code, error.message);

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new ApiError(504, "TMDB request timed out");
    }

    throw new ApiError(502, "Failed to reach TMDB");
};

/**
 * Internal helper — all TMDB GET requests go through here.
 */
const tmdbFetch = async (path, params = {}) => {
    // Strip undefined/null params (axios already skips undefined, but not null)
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
    );

    try {
        const { data } = await tmdbClient.get(path, { params: cleanParams });
        return data;
    } catch (error) {
        handleTmdbError(error, "TMDB request failed", path);
    }
};

export default tmdbFetch;