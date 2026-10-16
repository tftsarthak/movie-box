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
 * HELPER: sendAuthCallbackResponse
 *
 * Kyu banaya ye helper?
 * Pehle backend seedha `res.redirect(`${clientUrl}/dashboard`)` karta tha.
 * Lekin Pop-up window flow me agar redirect karenge, toh pop-up window ke andar hi poora dashboard khul jaayega!
 *
 * Isliye ab hum ek lightweight HTML response bhejte hain jo:
 * 1. window.opener (MovieBox ki main tab) ko `window.opener.postMessage(...)` ke through signal bhejta hai.
 * 2. window.close() call karke pop-up window ko automatically close kar deta hai.
 * 3. FALLBACK: Agar pop-up window nahi thi (user direct URL par aaya ya window.opener severed hai),
 *    toh script `window.location.replace(targetUrl)` karke normal redirect kar deta hai.
 */
const sendAuthCallbackResponse = (res, { success, status = "success", clientUrl }) => {
    const cleanClientUrl = (clientUrl || "http://localhost:5173").replace(/\/+$/, "");
    const redirectUrl = success
        ? `${cleanClientUrl}/dashboard`
        : `${cleanClientUrl}/login?status=${encodeURIComponent(status)}`;

    const messagePayload = success
        ? { type: "TMDB_AUTH_SUCCESS" }
        : { type: "TMDB_AUTH_ERROR", status };

    const serializedPayload = JSON.stringify(messagePayload);

    const title = success ? "Authorization Successful" : "Authorization Notice";
    const heading = success ? "Connected to MovieBox" : "Authorization Failed";
    const message = success
        ? "Your TMDB account has been linked. Closing window..."
        : (status === "denied"
            ? "TMDB authorization was denied. Closing window..."
            : "Could not complete authorization. Closing window...");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      background-color: #0c0d12;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: #141721;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 360px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    }
    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 22px;
      font-weight: bold;
    }
    .status-icon.success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .status-icon.error {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 16px;
      line-height: 1.5;
    }
    .fallback-link {
      display: inline-block;
      font-size: 12px;
      color: #ff5757;
      text-decoration: underline;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="status-icon ${success ? "success" : "error"}">
      ${success ? "&#10003;" : "&#33;"}
    </div>
    <h2>${heading}</h2>
    <p>${message}</p>
    <a id="fallback-link" class="fallback-link" style="display:none;" href="${redirectUrl}">Click here if this window does not close automatically</a>
  </div>
  <script>
    (function() {
      var clientOrigin = ${JSON.stringify(cleanClientUrl)};
      var payload = ${serializedPayload};
      var targetUrl = ${JSON.stringify(redirectUrl)};
      var hasOpener = false;

      // Check karo agar ye window kisi opener (main MovieBox tab) dwara kholi gayi thi
      try {
        if (window.opener && window.opener !== window) {
          hasOpener = true;
          // Main tab ko auth result bhejo (TMDB_AUTH_SUCCESS ya TMDB_AUTH_ERROR)
          window.opener.postMessage(payload, clientOrigin);
        }
      } catch (err) {
        console.warn("postMessage to opener failed:", err);
      }

      if (hasOpener) {
        // Pop-up window ko auto close karo thoda delay dekar taaki message deliver ho sake
        setTimeout(function() {
          try {
            window.close();
          } catch (e) {
            console.warn("window.close failed:", e);
          }
          // Agar browser script ko window close karne se roke toh fallback link show karo
          var link = document.getElementById("fallback-link");
          if (link) link.style.display = "inline-block";
        }, 400);
      } else {
        // Normal tab redirect agar pop-up nahi tha
        window.location.replace(targetUrl);
      }
    })();
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
};

/**
 * STEP 2: Handle TMDB Callback & Exchange Token for Session ID
 * Route: GET /api/v1/auth/tmdb/callback
 *
 * Flow:
 * 1. User ne TMDB popup par login/approve kar diya.
 * 2. TMDB server ne hamare backend callback route par redirect mara with query parameters: { request_token, approved, denied }
 * 3. State token cookie clear karo (CSRF cleanup).
 * 4. Checks lagao (denied toh nahi kiya, storedToken aur callbackToken match ho rahe hain ya nahi).
 * 5. TMDB createSession API call karke sessionId lo aur secure cookies me save karo.
 * 6. sendAuthCallbackResponse() call karo jo main tab ko notify karega aur popup ko close karega!
 */
export const handleTmdbCallback = asyncHandler(async (req, res) => {
    // officially it comes as "request_token", but we alias it as "callbackToken"
    // callbackToken aur storedToken same hone chahiye (agar match nahi hua toh Invalid State / CSRF)
    const { request_token: callbackToken, approved, denied } = req.query;
    const storedToken = req.cookies?.tmdb_auth_state;
    const clientUrl = process.env.CLIENT_URL || process.env.CORS_ORIGIN || "http://localhost:5173";

    // 1. Clear state cookie after reading
    res.clearCookie("tmdb_auth_state", COOKIE_OPTIONS);

    // 2. Handle user denial on TMDB page (agar user ne TMDB par "Deny" dabaya)
    if (denied === "true" || approved === "false") {
        return sendAuthCallbackResponse(res, {
            success: false,
            status: "denied",
            clientUrl,
        });
    }

    // 3. CSRF & State Validation (verify karo ki token wahi hai jo humne login initiation par bheja tha)
    if (!storedToken || !callbackToken || storedToken !== callbackToken) {
        return sendAuthCallbackResponse(res, {
            success: false,
            status: "invalid_state",
            clientUrl,
        });
    }

    try {
        const sessionData = await tmdbService.createSession(callbackToken);
        const sessionId = sessionData?.session_id;

        if (!sessionId) {
            return sendAuthCallbackResponse(res, {
                success: false,
                status: "session_failed",
                clientUrl,
            });
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

        return sendAuthCallbackResponse(res, {
            success: true,
            status: "success",
            clientUrl,
        });
    } catch (error) {
        console.error("Error creating TMDB session:", error?.message);

        const status = error?.response?.data?.status_code === 17 ? "expired" : "auth_failed";
        return sendAuthCallbackResponse(res, {
            success: false,
            status,
            clientUrl,
        });
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