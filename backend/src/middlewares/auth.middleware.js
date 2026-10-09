import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to verify that a valid TMDB session cookie is present.
 * Attaches `sessionId` to `req` for downstream controllers.
 */
export const verifyTmdbSession = asyncHandler(async (req, res, next) => {
    const sessionId = req.cookies?.tmdb_session_id;

    if (!sessionId) {
        throw new ApiError(401, "Unauthorized: No active TMDB session found");
    }

    req.sessionId = sessionId;
    next();
});
