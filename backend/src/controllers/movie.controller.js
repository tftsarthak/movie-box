import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as tmdbService from "../services/tmdb.service.js";

export const getTrendingMovies = asyncHandler(async (req, res) => {
    const { time_window = "day", page = 1 } = req.query;

    if (!["day", "week"].includes(time_window)) {
        throw new ApiError(400, "time_window must be 'day' or 'week'");
    }

    const data = await tmdbService.fetchTrendingMovies(time_window, Number(page));
    res.status(200).json(new ApiResponse(200, data, "Trending movies fetched"));
});

export const searchMovies = asyncHandler(async (req, res) => {
    const { query, page = 1 } = req.query;

    if (!query?.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const data = await tmdbService.searchMovies(query.trim(), Number(page));
    res.status(200).json(new ApiResponse(200, data, "Search results fetched"));
});

export const discoverMovies = asyncHandler(async (req, res) => {
    const { genre, year, sort_by, page = 1 } = req.query;

    const filters = {};
    if (genre) filters.genre = genre;
    if (year) filters.year = year;
    if (sort_by) filters.sort_by = sort_by;

    const data = await tmdbService.discoverMovies(filters, Number(page));
    res.status(200).json(new ApiResponse(200, data, "Discover results fetched"));
});

export const getGenres = asyncHandler(async (req, res) => {
    const data = await tmdbService.fetchGenres();
    res.status(200).json(new ApiResponse(200, data, "Genres fetched"));
});

export const getMovieDetails = asyncHandler(async (req, res) => {
    const { tmdbId } = req.params;
    const data = await tmdbService.fetchMovieDetails(tmdbId);
    res.status(200).json(new ApiResponse(200, data, "Movie details fetched"));
});

export const getMovieCredits = asyncHandler(async (req, res) => {
    const { tmdbId } = req.params;
    const data = await tmdbService.fetchMovieCredits(tmdbId);
    res.status(200).json(new ApiResponse(200, data, "Movie credits fetched"));
});

export const getSimilarMovies = asyncHandler(async (req, res) => {
    const { tmdbId } = req.params;
    const { page = 1 } = req.query;
    const data = await tmdbService.fetchSimilarMovies(tmdbId, Number(page));
    res.status(200).json(new ApiResponse(200, data, "Similar movies fetched"));
});
