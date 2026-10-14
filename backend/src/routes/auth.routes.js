import { Router } from "express";
import {
    initiateTmdbAuth,
    handleTmdbCallback,
    getTmdbAccount,
    logoutTmdb,
} from "../controllers/auth.controller.js";
import { verifyTmdbSession } from "../middlewares/auth.middleware.js";

const router = Router();

// TMDB OAuth / Session Initiation & Callback
router.get("/tmdb/login", initiateTmdbAuth);
router.get("/tmdb/callback", handleTmdbCallback);

// Account Profile Information (Protected)
router.get("/me", verifyTmdbSession, getTmdbAccount);

// Session Termination
router.post("/logout", logoutTmdb);

export default router;
