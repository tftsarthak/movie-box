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
// 1. frontend s req aai
// 2. tmdb se token le lia
// 3. token cookie m set kar dia 
// 4. ek authUrl banai jo official tmdb ki h (usme ek redirect karne ki url set kardi - apne backend ka callback route)
// 5. ye authUrl frontend ko return kardi
// 6. ab frontend is url p redirect krega

    const data = await tmdbService.createRequestToken();
    const requestToken = data?.request_token;

    if (!requestToken) {
        throw new ApiError(502, "Failed to create TMDB request token");
    }

    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const callbackUrl = `${appUrl}/api/v1/auth/tmdb/callback?redirect=true`;

    // 15-minute expiration for auth state token
    res.cookie("tmdb_auth_state", requestToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });

    const tmdbAuthUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(callbackUrl)}`;

    /*
When will the backend directly redirect?
Whenever the request URL includes the query parameter ?redirect=true.
*/

    if (req.query.redirect === "true") {
        return res.redirect(tmdbAuthUrl);
    }

/*
When will you get the JSON ApiResponse?
In all other cases — i.e., anytime ?redirect=true is not present in the URL.
*/

/*
When the user clicks the button:

React fetches the authUrl.
window.location.href = res.data.data.authUrl immediately takes the real user to the TMDB website to approve access.
Once approved, TMDB redirects the user back to your backend callback, which redirects to your dashboard.
*/

// we use this way
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                request_token: requestToken,
                authUrl: tmdbAuthUrl,
            },
            "TMDB request token generated successfully"
        )
    );

/* 
Do you need to extract authUrl and do a manual redirect from frontend?
Yes, exactly! If your frontend uses axios or fetch, you must extract authUrl and redirect manually.

// In your React component, manually redirect via window.location.href = res.data.authUrl;

*/

});

/**
 * STEP 2: Handle TMDB Callback & Exchange Token for Session ID
 * Route: GET /api/v1/auth/tmdb/callback
 */

// iska kam h redirect karna if success - dashboard par, else - login page par with error message in query param
export const handleTmdbCallback = asyncHandler(async (req, res) => {
// 1. tmdb n auth karne k baad ispe redirect mara hoga
// 2. tmdb server auto appends info as query parameters - { request_token, approved, denied }
// 3. clear token cookie
// 4. handle invalid states with some checks
// 5. hit session and account id api and set them in cookies
// 6. if everything correct - do "return res.redirect(`${clientUrl}/dashboard`);"


// officially it comes as "request_token", but we aliased it as "callbackToken"
// now request_token cannot be used. use - callbackToken instead.
// callbackToken and storedToken are the same (if not same - Invalid state)
    const { request_token: callbackToken, approved, denied } = req.query;
    const storedToken = req.cookies?.tmdb_auth_state;
    const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173";

    // Clear state cookie after reading
    res.clearCookie("tmdb_auth_state", COOKIE_OPTIONS);

    // Handle user denial on TMDB page
    if (denied === "true" || approved === "false") {
        return res.redirect(`${clientUrl}/login?status=denied`);
    }
    console.log("callbackToken : ", callbackToken, " storedToken : ", storedToken);
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

        // Pre-fetch and cache account ID in cookie to avoid round-trips for account-scoped operations
        try {
            const account = await tmdbService.fetchAccountDetails(sessionId);
            if (account?.id) {
                res.cookie("tmdb_account_id", String(account.id), {
                    ...COOKIE_OPTIONS,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
            }
        } catch (accErr) {
            console.warn("Could not pre-fetch account ID during TMDB login callback:", accErr.message);
        }
        //for external OAuth callbacks, a backend redirect is mandatory.
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
 * Route: POST /api/v1/auth/logout
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
    res.clearCookie("tmdb_account_id", COOKIE_OPTIONS);
    res.clearCookie("tmdb_auth_state", COOKIE_OPTIONS);

    // Default for React / Axios API calls (react handles redirect)
    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});