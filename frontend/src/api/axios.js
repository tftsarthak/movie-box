import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // send cookies with each req
  headers: {
    "Content-Type": "application/json",
  },
});
//no request interceptor needed as cookies are already sent

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps success in ApiResponse(statusCode, data, message, success)
    return response.data;
  },
  (error) => {
    const isCanceled = axios.isCancel(error);
    const status = error.response?.status || error.response?.data?.statusCode || 500;
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred";

    // Central 401 handling:
    // If a protected request (not the initial /auth/me check) returns 401, dispatch session-expired event
    if (status === 401 && !error.config?.url?.includes("/auth/me")) {
      window.dispatchEvent(new CustomEvent("moviebox:session-expired"));
    }

    const normalizedError = new Error(message);
    normalizedError.statusCode = status;
    normalizedError.errors = error.response?.data?.errors || [];
    normalizedError.isCanceled = isCanceled;
    normalizedError.raw = error;

    return Promise.reject(normalizedError);
  }
);

export default apiClient;

