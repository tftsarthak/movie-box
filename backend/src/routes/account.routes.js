import { Router } from "express";
import {
    getFavoriteMovies,
    getFavoriteTv,
    toggleFavorite,
    getWatchlistMovies,
    getWatchlistTv,
    toggleWatchlist,
    getMovieAccountStates,
    getTvAccountStates,
    getEpisodeAccountStates,
} from "../controllers/account.controller.js";
import { verifyTmdbSession } from "../middlewares/auth.middleware.js";

const router = Router();

// Enforce active TMDB session for all account operations
router.use(verifyTmdbSession);

// Favorites
router.get("/favorites/movies", getFavoriteMovies);
router.get("/favorites/tv", getFavoriteTv);
router.post("/favorite", toggleFavorite);

// Watchlist
router.get("/watchlist/movies", getWatchlistMovies);
router.get("/watchlist/tv", getWatchlistTv);
router.post("/watchlist", toggleWatchlist);

// Personal Account States
router.get("/states/movie/:movieId", getMovieAccountStates);
router.get("/states/tv/:seriesId", getTvAccountStates);
router.get("/states/tv/:seriesId/season/:seasonNumber/episode/:episodeNumber", getEpisodeAccountStates);

export default router;
