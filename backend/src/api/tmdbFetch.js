import { ApiError } from "../utils/ApiError.js";
import tmdbClient from "./tmdbClient.js";

/**
 * Common error handler for TMDB API requests.
 * Maps TMDB axios errors to ApiError.
 */
export const handleTmdbError = (error, defaultMessage = "TMDB request failed", path = "") => {
    if (error instanceof ApiError || error?.statusCode) {
        throw error;
    }

    if (error.response) {
        const { status, data } = error.response;
        const statusMessage = data?.status_message;

        if (status === 404) {
            const isMovie = typeof path === "string" && path.includes("/movie");
            const notFoundError = new ApiError(404, statusMessage || (isMovie ? "Movie not found" : "Resource not found"));
            notFoundError.response = error.response;
            notFoundError.data = data;
            throw notFoundError;
        }

        if (status === 400 || status === 422) {
            const badRequestError = new ApiError(status, statusMessage || "Invalid request to TMDB");
            badRequestError.response = error.response;
            badRequestError.data = data;
            throw badRequestError;
        }

        if (status === 401) {
            const authError = new ApiError(401, statusMessage || "TMDB authentication failed or session expired");
            authError.response = error.response;
            authError.data = data;
            throw authError;
        }

        if (status === 403) {
            const forbiddenError = new ApiError(403, statusMessage || "Access to TMDB resource forbidden");
            forbiddenError.response = error.response;
            forbiddenError.data = data;
            throw forbiddenError;
        }

        if (status === 429) {
            const rateLimitError = new ApiError(429, statusMessage || "Service temporarily unavailable. TMDB rate limit reached.");
            rateLimitError.response = error.response;
            rateLimitError.data = data;
            throw rateLimitError;
        }

        const upstreamError = new ApiError(status >= 500 ? 502 : status, statusMessage || defaultMessage);
        upstreamError.response = error.response;
        upstreamError.data = data;
        throw upstreamError;
    }

    if (
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ERR_CANCELED" ||
        error.message?.toLowerCase().includes("timeout") ||
        error.message?.toLowerCase().includes("timed out")
    ) {
        throw new ApiError(504, "TMDB request timed out");
    }

    if (error.request) {
        throw new ApiError(502, "Failed to reach TMDB");
    }

    throw new ApiError(error.statusCode || 500, error.message || defaultMessage);
};

/**
 * Universal helper for TMDB HTTP requests.
 * Supports GET, POST, DELETE, PUT with query params cleaning and data forwarding.
 * Retains backward compatibility with legacy calls: tmdbFetch(path, params)
 */
const tmdbFetch = async (path, options = {}, retries = 2) => {
    const isConfig = Boolean(options && (options.method || options.data || options.params));
    const method = (isConfig ? (options.method || "GET") : "GET").toUpperCase();
    const rawParams = isConfig ? (options.params || {}) : (options || {});
    const requestData = isConfig ? options.data : undefined;

    // Strip undefined/null params (axios skips undefined, but not null)
    const cleanParams = rawParams && typeof rawParams === "object"
        ? Object.fromEntries(
            Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null)
        )
        : {};

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await tmdbClient.request({
                url: path,
                method,
                params: cleanParams,
                data: requestData,
            });
            return response.data;
        } catch (error) {
            const isTransientNetworkError =
                error.code === "ECONNRESET" ||
                error.code === "ETIMEDOUT" ||
                error.code === "ECONNABORTED" ||
                error.code === "ERR_NETWORK";

            if (isTransientNetworkError && attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
                continue;
            }

            handleTmdbError(error, "TMDB request failed", path);
        }
    }
};

export default tmdbFetch;