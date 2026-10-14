import apiClient from "./axios";

// ─── Favorites ───────────────────────────────────────────────────────────────

/**
 * Retrieves favorite movies for the authenticated user
 * @param {number|{ page?: number, signal?: AbortSignal }} [page=1]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getFavoriteMovies = async (page = 1, options = {}) => {
  let pageNum = page;
  let opts = options;

  if (typeof page === "object" && page !== null) {
    opts = page;
    pageNum = page.page || 1;
  }

  const res = await apiClient.get("/account/favorites/movies", {
    params: { page: pageNum },
    signal: opts.signal,
  });
  return res.data ?? res;
};

/**
 * Retrieves favorite TV shows for the authenticated user
 * @param {number|{ page?: number, signal?: AbortSignal }} [page=1]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getFavoriteTv = async (page = 1, options = {}) => {
  let pageNum = page;
  let opts = options;

  if (typeof page === "object" && page !== null) {
    opts = page;
    pageNum = page.page || 1;
  }

  const res = await apiClient.get("/account/favorites/tv", {
    params: { page: pageNum },
    signal: opts.signal,
  });
  return res.data ?? res;
};

/**
 * Adds or removes media from favorites
 * @param {'movie'|'tv'|{ media_type?: string, mediaType?: string, media_id?: string|number, mediaId?: string|number, favorite: boolean }} mediaTypeOrPayload
 * @param {string|number|{ signal?: AbortSignal }} [mediaId]
 * @param {boolean} [favorite]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const toggleFavorite = async (
  mediaTypeOrPayload,
  mediaId,
  favorite,
  options = {}
) => {
  let payload;
  let opts = options;

  if (typeof mediaTypeOrPayload === "object" && mediaTypeOrPayload !== null) {
    payload = {
      media_type: mediaTypeOrPayload.media_type || mediaTypeOrPayload.mediaType,
      media_id: String(mediaTypeOrPayload.media_id ?? mediaTypeOrPayload.mediaId),
      favorite: Boolean(mediaTypeOrPayload.favorite),
    };
    opts = typeof mediaId === "object" && mediaId !== null ? mediaId : options;
  } else {
    payload = {
      media_type: mediaTypeOrPayload,
      media_id: String(mediaId),
      favorite: Boolean(favorite),
    };
  }

  const res = await apiClient.post("/account/favorite", payload, {
    signal: opts.signal,
  });
  return res.data ?? res;
};

// ─── Watchlist ───────────────────────────────────────────────────────────────

/**
 * Retrieves user's watchlist movies
 * @param {number|{ page?: number, signal?: AbortSignal }} [page=1]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getWatchlistMovies = async (page = 1, options = {}) => {
  let pageNum = page;
  let opts = options;

  if (typeof page === "object" && page !== null) {
    opts = page;
    pageNum = page.page || 1;
  }

  const res = await apiClient.get("/account/watchlist/movies", {
    params: { page: pageNum },
    signal: opts.signal,
  });
  return res.data ?? res;
};

/**
 * Retrieves user's watchlist TV shows
 * @param {number|{ page?: number, signal?: AbortSignal }} [page=1]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getWatchlistTv = async (page = 1, options = {}) => {
  let pageNum = page;
  let opts = options;

  if (typeof page === "object" && page !== null) {
    opts = page;
    pageNum = page.page || 1;
  }

  const res = await apiClient.get("/account/watchlist/tv", {
    params: { page: pageNum },
    signal: opts.signal,
  });
  return res.data ?? res;
};

/**
 * Adds or removes media from watchlist
 * @param {'movie'|'tv'|{ media_type?: string, mediaType?: string, media_id?: string|number, mediaId?: string|number, watchlist: boolean }} mediaTypeOrPayload
 * @param {string|number|{ signal?: AbortSignal }} [mediaId]
 * @param {boolean} [watchlist]
 * @param {{ signal?: AbortSignal }} [options]
 */
export const toggleWatchlist = async (
  mediaTypeOrPayload,
  mediaId,
  watchlist,
  options = {}
) => {
  let payload;
  let opts = options;

  if (typeof mediaTypeOrPayload === "object" && mediaTypeOrPayload !== null) {
    payload = {
      media_type: mediaTypeOrPayload.media_type || mediaTypeOrPayload.mediaType,
      media_id: String(mediaTypeOrPayload.media_id ?? mediaTypeOrPayload.mediaId),
      watchlist: Boolean(mediaTypeOrPayload.watchlist),
    };
    opts = typeof mediaId === "object" && mediaId !== null ? mediaId : options;
  } else {
    payload = {
      media_type: mediaTypeOrPayload,
      media_id: String(mediaId),
      watchlist: Boolean(watchlist),
    };
  }

  const res = await apiClient.post("/account/watchlist", payload, {
    signal: opts.signal,
  });
  return res.data ?? res;
};

// ─── Personal Account States ─────────────────────────────────────────────────

/**
 * Returns user's interaction state (rated, favorited, watchlisted) for a movie
 * @param {string|number} movieId
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getMovieAccountStates = async (movieId, options = {}) => {
  const res = await apiClient.get(`/account/states/movie/${movieId}`, {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Returns user's interaction state for a TV show
 * @param {string|number} seriesId
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getTvAccountStates = async (seriesId, options = {}) => {
  const res = await apiClient.get(`/account/states/tv/${seriesId}`, {
    signal: options.signal,
  });
  return res.data ?? res;
};

/**
 * Returns user's interaction state for a specific TV episode
 * @param {string|number} seriesId
 * @param {string|number} seasonNumber
 * @param {string|number} episodeNumber
 * @param {{ signal?: AbortSignal }} [options]
 */
export const getEpisodeAccountStates = async (
  seriesId,
  seasonNumber,
  episodeNumber,
  options = {}
) => {
  const res = await apiClient.get(
    `/account/states/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
    {
      signal: options.signal,
    }
  );
  return res.data ?? res;
};
