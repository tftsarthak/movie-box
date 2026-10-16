import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { initiateTmdbAuth, getTmdbAccount, logoutTmdb } from "@/api/authApi";
import { API_BASE_URL } from "@/lib/constants";

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


  /**
   * Initiates TMDB OAuth flow via a dedicated centered pop-up window.
   *
   * Flow for freshers/beginners:
   * 1. Centered Popup Dimensions: Screen ke center me 600x700 window ka position calculate karte hain.
   * 2. Popup Blocker Prevention: Modern browsers click event ke baad async await aane par window.open
   *    ko popup blocker se block kar dete hain. Isliye user gesture (click) ke waqt hi 'about:blank' popup
   *    open karte hain, fir backend se URL aate hi `popup.location.href = authUrl` kar dete hain.
   * 3. postMessage Communication: TMDB par approve karne ke baad backend callback HTML script
   *    `window.opener.postMessage()` ke through signal bhejta hai.
   * 4. Origin Security Check: Cross-site attacks se bachne ke liye `event.origin` verify karte hain.
   * 5. Fallback Closed Polling: Agar user beech me popup ka cross (X) daba de ya script window close kar de,
   *    toh `setInterval` detect kar leta hai aur loading state gracefully reset karta hai.
   */
  const login = useCallback(
    async (options = {}) => {
      setError(null);
      const { usePopup = true, signal, ...restOptions } = options;

      // Fallback flow: standard full-page redirect if explicitly requested
      if (!usePopup) {
        try {
          const res = await initiateTmdbAuth({ signal, ...restOptions });
          const data = res?.data ?? res;
          const authUrl = data?.authUrl;

          if (!authUrl) {
            throw new Error("Unable to obtain TMDB authorization URL");
          }

          window.location.href = authUrl;
          return authUrl;
        } catch (err) {
          if (err?.isCanceled || err?.name === "CanceledError" || signal?.aborted) {
            return null;
          }
          const message = err?.message || "Failed to initiate login";
          setError(message);
          toast.error(message, { id: "auth-login-error" });
          throw err;
        }
      }

      // Step 1: Centered 600x700 pop-up window coordinates
      const width = 600;
      const height = 700;
      const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
      const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
      const popupFeatures = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,status=no,resizable=yes`;

      // Step 2: Open popup synchronously during user click event to prevent browser popup blockers
      let popup = null;
      try {
        popup = window.open("about:blank", "tmdb_oauth", popupFeatures);
      } catch (popupErr) {
        console.warn("Synchronous popup open prevented:", popupErr);
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;

        // Sare event listeners aur interval timers ko cleanup karne wala helper
        const cleanup = () => {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }
          window.removeEventListener("message", handleMessage);
        };

        const finishResolve = (userData) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(userData);
        };

        const finishReject = (error) => {
          if (settled) return;
          settled = true;
          cleanup();
          if (popup && !popup.closed) {
            try {
              popup.close();
            } catch (closeErr) {
              void closeErr;
            }
          }
          reject(error);
        };

        if (signal) {
          signal.addEventListener("abort", () => {
            finishReject(new Error("Login aborted"));
          });
        }

        // Step 3: Listener - Backend callback HTML pop-up se window.opener.postMessage() bhejega
        const handleMessage = async (event) => {
          let isAllowed = false;
          // Security Check: Verify karo ki message genuine hai (sirf backend origin ya client origin se)
          try {
            const backendOrigin = new URL(API_BASE_URL).origin;
            const clientOrigin = window.location.origin;
            isAllowed = event.origin === backendOrigin || event.origin === clientOrigin;
          } catch (originErr) {
            void originErr;
          }

          if (!isAllowed) return;

          // Success Case: TMDB login successful, user profile refresh karo
          if (event.data?.type === "TMDB_AUTH_SUCCESS") {
            try {
              const userData = await checkAuth({ showLoading: true });
              toast.success("Successfully connected to TMDB!", { id: "auth-success" });
              finishResolve(userData);
            } catch (err) {
              finishReject(err);
            }
          // Error Case: User ne TMDB page par Deny kiya ya token expire hua
          } else if (event.data?.type === "TMDB_AUTH_ERROR") {
            const status = event.data?.status || "auth_failed";
            let message = "TMDB authentication failed.";
            if (status === "denied") {
              message = "TMDB authorization was denied.";
            } else if (status === "expired") {
              message = "Authorization request expired. Please try again.";
            }
            setError(message);
            toast.error(message, { id: "auth-login-error" });
            finishReject(new Error(message));
          }
        };

        window.addEventListener("message", handleMessage);

        // Step 4: Backend se TMDB authUrl mango aur popup ko us URL par le jao
        initiateTmdbAuth({ signal, ...restOptions })
          .then((res) => {
            const data = res?.data ?? res;
            const authUrl = data?.authUrl;

            if (!authUrl) {
              throw new Error("Unable to obtain TMDB authorization URL");
            }

            if (popup && !popup.closed) {
              popup.location.href = authUrl;
              try {
                popup.focus?.();
              } catch (focusErr) {
                void focusErr;
              }
            } else {
              // Popup was blocked by browser; fallback to full page redirect
              window.location.href = authUrl;
              return;
            }

            // Step 5: Polling Safety Net - Agar user ne popup bina approve kiye manually band kar diya
            timer = setInterval(async () => {
              if (!popup || popup.closed) {
                clearInterval(timer);
                timer = null;

                // Brief grace period taaki agar window script se close hui ho toh postMessage process ho sake
                setTimeout(async () => {
                  if (settled) return;
                  try {
                    const userData = await checkAuth();
                    if (userData && userData.id) {
                      toast.success("Successfully connected to TMDB!", { id: "auth-success" });
                      finishResolve(userData);
                    } else {
                      // User closed popup without approving
                      finishResolve(null);
                    }
                  } catch (checkErr) {
                    void checkErr;
                    finishResolve(null);
                  }
                }, 350);
              }
            }, 500);
          })
          .catch((err) => {
            if (popup && !popup.closed) {
              try {
                popup.close();
              } catch (closeErr) {
                void closeErr;
              }
            }
            if (err?.isCanceled || err?.name === "CanceledError" || signal?.aborted) {
              finishResolve(null);
              return;
            }
            const message = err?.message || "Failed to initiate login";
            setError(message);
            toast.error(message, { id: "auth-login-error" });
            finishReject(err);
          });
      });
    },
    [checkAuth]
  );


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




// 1. It Mounts Once for the Whole Session When a user first opens your app, the top-level Auth Context mounts. The useEffect runs exactly once, sets up the window.addEventListener(), and then safely falls asleep.

// 2. Moving Between Pages Doesn't Reset It

// As the user navigates between different pages (e.g., from Dashboard to Profile to Settings), your page components mount and unmount, but your Auth Context never leaves the screen. Because the context stays alive, the useEffect never unmounts, and the return cleanup function is never triggered during normal navigation.
// The browser will continuously listen for that moviebox:session-expired event the entire time the user clicks around your app.

// 3. It Only Unmounts on a Hard Refresh or Exit

// The removeEventListener cleanup code will only execute under two conditions:
// • The user closes the tab/browser window.
// • The user performs a hard browser refresh (F5 / Cmd+R), which completely wipes the React state and reloads the entire application from scratch.



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
