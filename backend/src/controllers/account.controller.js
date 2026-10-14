import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as tmdbService from "../services/tmdb.service.js";

// ─── Favorites Controllers ────────────────────────────────────────────

/**
 * Get user's favorite movies.
 * Route: GET /api/v1/account/favorites/movies
 */
export const getFavoriteMovies = asyncHandler(async (req, res) => {
    const { page = 1, sort_by = "created_at.desc" } = req.query;
    const data = await tmdbService.fetchFavoriteMovies(
        req.accountId,
        req.sessionId,
        Number(page),
        sort_by
    );
    return res.status(200).json(new ApiResponse(200, data, "Favorite movies fetched successfully"));
});

/**
 * Get user's favorite TV shows.
 * Route: GET /api/v1/account/favorites/tv
 */
export const getFavoriteTv = asyncHandler(async (req, res) => {
    const { page = 1, sort_by = "created_at.desc" } = req.query;
    const data = await tmdbService.fetchFavoriteTv(
        req.accountId,
        req.sessionId,
        Number(page),
        sort_by
    );
    return res.status(200).json(new ApiResponse(200, data, "Favorite TV shows fetched successfully"));
});

/**
 * Add or remove item from favorites.
 * Route: POST /api/v1/account/favorite
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
    const { media_type, media_id, favorite } = req.body;

    if (!["movie", "tv"].includes(media_type)) {
        throw new ApiError(400, "media_type must be 'movie' or 'tv'");
    }
    if (!media_id || isNaN(Number(media_id))) {
        throw new ApiError(400, "Valid numeric media_id is required");
    }
    if (typeof favorite !== "boolean") {
        throw new ApiError(400, "favorite must be a boolean (true to add, false to remove)");
    }

    const data = await tmdbService.updateFavorite(req.accountId, req.sessionId, {
        mediaType: media_type,
        mediaId: Number(media_id),
        favorite,
    });

    const actionText = favorite ? "added to" : "removed from";
    return res.status(200).json(new ApiResponse(200, data, `Item ${actionText} favorites successfully`));
});

// ─── Watchlist Controllers ────────────────────────────────────────────

/**
 * Get user's watchlist movies.
 * Route: GET /api/v1/account/watchlist/movies
 */
export const getWatchlistMovies = asyncHandler(async (req, res) => {
    const { page = 1, sort_by = "created_at.desc" } = req.query;
    const data = await tmdbService.fetchWatchlistMovies(
        req.accountId,
        req.sessionId,
        Number(page),
        sort_by
    );
    return res.status(200).json(new ApiResponse(200, data, "Watchlist movies fetched successfully"));
});

/**
 * Get user's watchlist TV shows.
 * Route: GET /api/v1/account/watchlist/tv
 */
export const getWatchlistTv = asyncHandler(async (req, res) => {
    const { page = 1, sort_by = "created_at.desc" } = req.query;
    const data = await tmdbService.fetchWatchlistTv(
        req.accountId,
        req.sessionId,
        Number(page),
        sort_by
    );
    return res.status(200).json(new ApiResponse(200, data, "Watchlist TV shows fetched successfully"));
});

/**
 * Add or remove item from watchlist.
 * Route: POST /api/v1/account/watchlist
 */
export const toggleWatchlist = asyncHandler(async (req, res) => {
    const { media_type, media_id, watchlist } = req.body;

    if (!["movie", "tv"].includes(media_type)) {
        throw new ApiError(400, "media_type must be 'movie' or 'tv'");
    }
    if (!media_id || isNaN(Number(media_id))) {
        throw new ApiError(400, "Valid numeric media_id is required");
    }
    if (typeof watchlist !== "boolean") {
        throw new ApiError(400, "watchlist must be a boolean (true to add, false to remove)");
    }

    const data = await tmdbService.updateWatchlist(req.accountId, req.sessionId, {
        mediaType: media_type,
        mediaId: Number(media_id),
        watchlist,
    });

    const actionText = watchlist ? "added to" : "removed from";
    return res.status(200).json(new ApiResponse(200, data, `Item ${actionText} watchlist successfully`));
});

// ─── Personal Account States Controllers ──────────────────────────────

/**
 * Check favorite, watchlist, and rating states for a specific movie.
 * Route: GET /api/v1/account/states/movie/:movieId
 */
export const getMovieAccountStates = asyncHandler(async (req, res) => {
    const movieId = req.params.movieId || req.params.tmdbId;
    if (!movieId) {
        throw new ApiError(400, "Movie ID parameter is required");
    }

    const data = await tmdbService.fetchMovieAccountStates(movieId, req.sessionId);
    return res.status(200).json(new ApiResponse(200, data, "Movie account states fetched successfully"));
});

/**
 * Check favorite, watchlist, and rating states for a TV show.
 * Route: GET /api/v1/account/states/tv/:seriesId
 */
export const getTvAccountStates = asyncHandler(async (req, res) => {
    const { seriesId } = req.params;
    if (!seriesId) {
        throw new ApiError(400, "seriesId parameter is required");
    }

    const data = await tmdbService.fetchTvAccountStates(seriesId, req.sessionId);
    return res.status(200).json(new ApiResponse(200, data, "TV show account states fetched successfully"));
});

/**
 * Check rating state for a specific TV episode.
 * Route: GET /api/v1/account/states/tv/:seriesId/season/:seasonNumber/episode/:episodeNumber
 */
export const getEpisodeAccountStates = asyncHandler(async (req, res) => {
    const { seriesId, seasonNumber, episodeNumber } = req.params;
    if (!seriesId || !seasonNumber || !episodeNumber) {
        throw new ApiError(400, "seriesId, seasonNumber, and episodeNumber are required parameters");
    }

    const data = await tmdbService.fetchEpisodeAccountStates(
        seriesId,
        seasonNumber,
        episodeNumber,
        req.sessionId
    );
    return res.status(200).json(new ApiResponse(200, data, "Episode account states fetched successfully"));
});
