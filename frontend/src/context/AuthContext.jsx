import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { initiateTmdbAuth, getTmdbAccount, logoutTmdb } from "@/api/authApi";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the currently authenticated TMDB user profile.
   * Silently resets to null if unauthenticated (401).
   */
  const checkAuth = useCallback(async (options = {}) => {
    if (options?.showLoading) {
      setLoading(true);
    }
    try {
      const res = await getTmdbAccount(options);
      const data = res?.data ?? res;

      if (data && data.id) {
        setUser(data);
        setError(null);
        return data;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      if (err?.isCanceled || err?.name === "CanceledError" || options?.signal?.aborted) {
        return null;
      }

      setUser(null);
      if (err?.statusCode === 401) {
        // Expected for visitors without an active session
        setError(null);
      } else {
        setError(err?.message || "Failed to load authentication state");
      }
      return null;
    } finally {
      if (!options?.signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Initiates TMDB OAuth flow via direct backend redirect with ?redirect=true.
   * This guarantees first-party cookie creation on localhost:3000 and clean 302 navigation to TMDB.
   */


  // const login = useCallback(async () => {
  //   setError(null);
  //   try {
  //     window.location.href = `${API_BASE_URL}/auth/tmdb/login?redirect=true`;
  //     return true;
  //   } catch (err) {
  //     const message = err?.message || "Failed to initiate login";
  //     setError(message);
  //     toast.error(message, { id: "auth-login-error" });
  //     throw err;
  //   }
  // }, []);


  const login = useCallback(async (options = {}) => {
    setError(null);
    try {
      const res = await initiateTmdbAuth(options);
      const data = res?.data ?? res;
      const authUrl = data?.authUrl;

      if (!authUrl) {
        throw new Error("Unable to obtain TMDB authorization URL");
      }

      // Redirect user to TMDB with the validated callbackUrl
      window.location.href = authUrl;
      return authUrl;
    } catch (err) {
      if (err?.isCanceled || err?.name === "CanceledError" || options?.signal?.aborted) {
        return null;
      }

      const message = err?.message || "Failed to initiate login";
      setError(message);
      toast.error(message, { id: "auth-login-error" });
      throw err;
    }
  }, []);


  /**
   * Logs out the user by deleting TMDB session cookies and resetting local state.
   */
  const logout = useCallback(async (options = {}) => {
    setError(null);
    try {
      await logoutTmdb(options);
      setUser(null);
      toast.success("Logged out successfully", { id: "auth-logout" });
      return true;
    } catch (err) {
      if (err?.isCanceled || err?.name === "CanceledError" || options?.signal?.aborted) {
        return false;
      }

      // Clear local user state even if remote call had an issue
      setUser(null);
      const message = err?.message || "Failed to log out cleanly";
      setError(message);
      toast.error(message, { id: "auth-logout-error" });
      throw err;
    }
  }, []);

  // Listen for central 401 session-expired event dispatched by axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser((prevUser) => {
        if (prevUser) {
          toast.error("Your session has expired. Please log in again.", {
            id: "session-expired",
          });
        }
        return null;
      });
      setError(null);
    };

    window.addEventListener("moviebox:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("moviebox:session-expired", handleSessionExpired);
    };
  }, []);

  // Check auth session on initial mount with StrictMode-safe cancellation
  useEffect(() => {
    const controller = new AbortController();

    getTmdbAccount({ signal: controller.signal })
      .then((res) => {
        const data = res?.data ?? res;
        if (data && data.id) {
          setUser(data);
          setError(null);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        if (err?.isCanceled || err?.name === "CanceledError" || controller.signal.aborted) {
          return;
        }
        setUser(null);
        if (err?.statusCode !== 401) {
          setError(err?.message || "Failed to load authentication state");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      error,
      login,
      logout,
      checkAuth,
      setUser,
    }),
    [user, loading, error, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
