import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as tmdbService from "../services/tmdb.service.js";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
};

/**
 * STEP 1: Initiate TMDB Authentication
 * Fetches a request token from TMDB, sets an HTTP-only state cookie to mitigate CSRF,
 * and redirects user to TMDB for authorization.
 * Route: GET /api/v1/auth/tmdb/login
 */
export const initiateTmdbAuth = asyncHandler(async (req, res) => {
    const data = await tmdbService.createRequestToken();
    const requestToken = data?.request_token;

    if (!requestToken) {
        throw new ApiError(502, "Failed to create TMDB request token");
    }

    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const callbackUrl = `${appUrl}/api/v1/auth/tmdb/callback`;

    // 15-minute expiration for auth state token
    res.cookie("tmdb_auth_state", requestToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });

    const tmdbAuthUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(callbackUrl)}`;

    if (req.query.redirect === "false") {
        return res.status(200).json(new ApiResponse(200, { authUrl: tmdbAuthUrl }, "TMDB auth URL generated"));
    }

    return res.redirect(tmdbAuthUrl);
});

/**
 * STEP 2: Handle TMDB Callback & Exchange Token for Session ID
 * Route: GET /api/v1/auth/tmdb/callback
 */
export const handleTmdbCallback = asyncHandler(async (req, res) => {
    const { request_token: callbackToken, approved, denied } = req.query;
    const storedToken = req.cookies?.tmdb_auth_state;
    const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173";

    // Clear state cookie after reading
    res.clearCookie("tmdb_auth_state", COOKIE_OPTIONS);

    // Handle user denial on TMDB page
    if (denied === "true" || approved === "false") {
        return res.redirect(`${clientUrl}/login?status=denied`);
    }

    // CSRF & State Validation
    if (!storedToken || !callbackToken || storedToken !== callbackToken) {
        return res.redirect(`${clientUrl}/login?status=invalid_state`);
    }

    try {
        const sessionData = await tmdbService.createSession(callbackToken);
        const sessionId = sessionData?.session_id;

        if (!sessionId) {
            return res.redirect(`${clientUrl}/login?status=session_failed`);
        }

        // Store session ID in secure HTTP-only cookie (30 days)
        res.cookie("tmdb_session_id", sessionId, {
            ...COOKIE_OPTIONS,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(`${clientUrl}/dashboard`);
    } catch (error) {
        console.error("Error creating TMDB session:", error?.message);

        if (error?.response?.data?.status_code === 17) {
            return res.redirect(`${clientUrl}/login?status=expired`);
        }

        return res.redirect(`${clientUrl}/login?status=auth_failed`);
    }
});

/**
 * STEP 3: Get Authenticated TMDB User Account Details
 * Route: GET /api/v1/auth/me or GET /api/v1/auth/tmdb/account
 */
export const getTmdbAccount = asyncHandler(async (req, res) => {
    const sessionId = req.sessionId || req.cookies?.tmdb_session_id;

    if (!sessionId) {
        throw new ApiError(401, "Unauthorized: No active TMDB session found");
    }

    const accountData = await tmdbService.fetchAccountDetails(sessionId);
    return res.status(200).json(new ApiResponse(200, accountData, "TMDB user account fetched successfully"));
});

/**
 * STEP 4: Logout & Invalidate TMDB Session
 * Route: POST /api/v1/auth/logout (also supports GET /api/v1/auth/logout)
 */
export const logoutTmdb = asyncHandler(async (req, res) => {
    const sessionId = req.cookies?.tmdb_session_id;

    if (sessionId) {
        try {
            await tmdbService.deleteSession(sessionId);
        } catch (error) {
            console.error("Error deleting TMDB session remotely:", error?.message);
        }
    }

    res.clearCookie("tmdb_session_id", COOKIE_OPTIONS);
    res.clearCookie("tmdb_auth_state", COOKIE_OPTIONS);

    if (req.method === "GET" && req.query.redirect === "true") {
        const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
        return res.redirect(`${clientUrl}/login?status=logged_out`);
    }

    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});