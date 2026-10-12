import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchAccountDetails } from "../services/tmdb.service.js";

const isProduction = process.env.NODE_ENV === "production";

const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Middleware to verify that a valid TMDB session cookie is present.
 * Attaches `sessionId` and `accountId` to `req` for downstream controllers,
 * and implements a sliding session window by resetting the 30-day expiration on active visits.
 */
export const verifyTmdbSession = asyncHandler(async (req, res, next) => {
    const sessionId = req.cookies?.tmdb_session_id;

    if (!sessionId) {
        throw new ApiError(401, "Unauthorized: No active TMDB session found");
    }

    req.sessionId = sessionId;

    let accountId = req.cookies?.tmdb_account_id;
    if (!accountId) {
        try {
            const account = await fetchAccountDetails(sessionId);
            if (account?.id) {
                accountId = String(account.id);
            }
        } catch (error) {
            console.error("Error resolving TMDB account in auth middleware:", error.message);
            throw new ApiError(401, "Unauthorized: Invalid or expired TMDB session");
        }
    }

    req.accountId = accountId;

    // Sliding session window: automatically reset the 30-day clock on each active request
    res.cookie("tmdb_session_id", sessionId, SESSION_COOKIE_OPTIONS);
    if (accountId) {
        res.cookie("tmdb_account_id", accountId, SESSION_COOKIE_OPTIONS);
    }

    next();
});
