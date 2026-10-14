import apiClient from "./axios";

/**
 * Initiates TMDB OAuth flow by requesting a request token to redirect the user to TMDB grant-access page
 * @param {{ signal?: AbortSignal }} [options]
 */
export const initiateTmdbAuth = async (options = {}) => {
  const res = await apiClient.get("/auth/tmdb/login", {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Handles TMDB OAuth callback and exchanges the approved request token for a session ID
 * @param {string|{ request_token?: string, requestToken?: string, approved?: boolean }} requestTokenOrPayload
 * @param {boolean|{ signal?: AbortSignal }} [approved=true]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const handleTmdbCallback = async (
  requestTokenOrPayload,
  approved = true,
  options = {}
) => {
  let token = requestTokenOrPayload;
  let isApproved = approved;
  let opts = options;

  if (typeof requestTokenOrPayload === "object" && requestTokenOrPayload !== null) {
    token = requestTokenOrPayload.request_token || requestTokenOrPayload.requestToken;
    isApproved =
      requestTokenOrPayload.approved !== undefined
        ? requestTokenOrPayload.approved
        : true;
    opts = typeof approved === "object" && approved !== null ? approved : options;
  }

  const res = await apiClient.get("/auth/tmdb/callback", {
    params: {
      request_token: token,
      approved: isApproved,
    },
    signal: opts.signal,
  });
  return res.data ?? res;
};

/**
 * Retrieves TMDB account details for the authenticated user
 * @param {string|{ request_token?: string, requestToken?: string, signal?: AbortSignal }} [requestTokenOrOptions]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getTmdbAccount = async (requestTokenOrOptions, options = {}) => {
  let token = requestTokenOrOptions;
  let opts = options;

  if (typeof requestTokenOrOptions === "object" && requestTokenOrOptions !== null) {
    if ("request_token" in requestTokenOrOptions || "requestToken" in requestTokenOrOptions) {
      token = requestTokenOrOptions.request_token || requestTokenOrOptions.requestToken;
    } else {
      opts = requestTokenOrOptions;
      token = undefined;
    }
  }

  const config = {
    signal: opts.signal,
  };

  if (token) {
    config.data = { request_token: token };
  }

  const res = await apiClient.get("/auth/me", config);
  return res.data ?? res;
};

/**
 * Deletes the active TMDB session to log out the user
 * @param {string|{ request_token?: string, requestToken?: string, signal?: AbortSignal }} [requestTokenOrOptions]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const logoutTmdb = async (requestTokenOrOptions, options = {}) => {
  let token = requestTokenOrOptions;
  let opts = options;

  if (typeof requestTokenOrOptions === "object" && requestTokenOrOptions !== null) {
    if ("request_token" in requestTokenOrOptions || "requestToken" in requestTokenOrOptions) {
      token = requestTokenOrOptions.request_token || requestTokenOrOptions.requestToken;
    } else {
      opts = requestTokenOrOptions;
      token = undefined;
    }
  }

  const payload = token ? { request_token: token } : {};
  const config = {
    signal: opts.signal,
  };

  const res = await apiClient.post("/auth/logout", payload, config);
  return res.data ?? res;
};
