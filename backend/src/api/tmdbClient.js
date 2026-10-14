import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

tmdbClient.interceptors.request.use((config) => {
    const rawToken = process.env.TMDB_ACCESS_TOKEN;
    if (!rawToken) {
        throw new ApiError(500, "TMDB configuration error: TMDB_ACCESS_TOKEN is missing");
    }
    const token = rawToken.trim().replace(/^["']|["']$/g, "");
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default tmdbClient;
