import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to extract standard ApiResponse data structure if present
apiClient.interceptors.response.use(
  (response) => {
    // If backend uses ApiResponse(statusCode, data, message), return response.data
    return response.data;
  },
  (error) => {
    // Pass normalized error
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
