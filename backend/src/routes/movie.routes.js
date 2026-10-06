import { Router } from "express";
import {
    getTrendingMovies,
    searchMovies,
    discoverMovies,
    getGenres,
    getMovieDetails,
    getMovieCredits,
    getSimilarMovies,
} from "../controllers/movie.controller.js";

const router = Router();

// Specific string routes first — before the :tmdbId param route
router.get("/trending", getTrendingMovies);
router.get("/search", searchMovies);
router.get("/discover", discoverMovies);
router.get("/genres", getGenres);

// Param routes
router.get("/:tmdbId", getMovieDetails);
router.get("/:tmdbId/credits", getMovieCredits);
router.get("/:tmdbId/similar", getSimilarMovies);

export default router;
