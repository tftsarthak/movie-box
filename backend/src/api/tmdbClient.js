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
    if (!process.env.TMDB_ACCESS_TOKEN) {
        throw new ApiError(500, "TMDB configuration error");
    }
    config.headers.Authorization = `Bearer ${process.env.TMDB_ACCESS_TOKEN}`;
    return config;
});

export default tmdbClient;
