export const TMDB_IMAGE_BASE_URL = {
  poster: "https://image.tmdb.org/t/p/w500",
  posterOriginal: "https://image.tmdb.org/t/p/original",
  backdrop: "https://image.tmdb.org/t/p/w1280",
  backdropOriginal: "https://image.tmdb.org/t/p/original",
  profile: "https://image.tmdb.org/t/p/w185",
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const DEFAULT_PAGE_SIZE = 20;

export const PLACEHOLDER_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
export const PLACEHOLDER_BACKDROP =
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1280&auto=format&fit=crop&q=80";
