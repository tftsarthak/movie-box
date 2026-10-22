import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getTmdbAccount, initiateTmdbAuth, logoutTmdb } from "@/api/authApi";
import { API_BASE_URL } from "@/lib/constants";

// ─── Query Key Factory ──────────────────────────────────────────────────────
export const authKeys = {
  all: () => ["auth"],
  user: () => [...authKeys.all(), "user"],
};

// ─── User Query ────────────────────────────────────────────────────────────
/**
 * Query for the currently authenticated TMDB user profile.
 * Stale time is Infinity because user state changes strictly through explicit login/logout.
 */
export const useUser = () =>
  useQuery({
    queryKey: authKeys.user(),
    queryFn: async ({ signal }) => {
      try {
        const res = await getTmdbAccount({ signal });
        const data = res?.data ?? res;
        return data?.id ? data : null;
      } catch (err) {
        if (err?.statusCode === 401) {
          // Expected for unauthenticated visitors — not an error
          return null;
        }
        throw err;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

// ─── Logout Mutation ────────────────────────────────────────────────────────
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options = {}) => logoutTmdb(options),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.removeQueries({ queryKey: ["account"] });
      toast.success("Logged out successfully", { id: "auth-logout" });
    },
    onError: (err) => {
      queryClient.setQueryData(authKeys.user(), null);
      toast.error(err?.message || "Failed to log out cleanly", {
        id: "auth-logout-error",
      });
    },
  });
};

// ─── Login Hook (OAuth Popup Flow) ──────────────────────────────────────────
/**
 * Imperative OAuth flow via a centered popup window.
 * Updates the user cache on success and invalidates any dependent queries.
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(
    async (options = {}) => {
      try {
        const res = await getTmdbAccount(options);
        const data = res?.data ?? res;
        if (data && data.id) {
          queryClient.setQueryData(authKeys.user(), data);
          return data;
        } else {
          queryClient.setQueryData(authKeys.user(), null);
          return null;
        }
      } catch (err) {
        if (err?.isCanceled || err?.name === "CanceledError" || options?.signal?.aborted) {
          return null;
        }
        queryClient.setQueryData(authKeys.user(), null);
        return null;
      }
    },
    [queryClient]
  );

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

        const finishReject = (err) => {
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
          reject(err);
        };

        if (signal) {
          signal.addEventListener("abort", () => {
            finishReject(new Error("Login aborted"));
          });
        }

        // Step 3: Listener - Backend callback HTML pop-up sends window.opener.postMessage()
        const handleMessage = async (event) => {
          let isAllowed = false;
          try {
            const backendOrigin = new URL(API_BASE_URL).origin;
            const clientOrigin = window.location.origin;
            isAllowed = event.origin === backendOrigin || event.origin === clientOrigin;
          } catch (originErr) {
            void originErr;
          }

          if (!isAllowed) return;

          // Success Case: TMDB login successful, refresh user profile
          if (event.data?.type === "TMDB_AUTH_SUCCESS") {
            try {
              const userData = await fetchUserProfile();
              toast.success("Successfully connected to TMDB!", { id: "auth-success" });
              finishResolve(userData);
            } catch (err) {
              finishReject(err);
            }
          // Error Case: User denied or token expired
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

        // Step 4: Ask backend for authUrl and navigate popup
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

            // Step 5: Polling Safety Net - if user manually closed the popup
            timer = setInterval(async () => {
              if (!popup || popup.closed) {
                clearInterval(timer);
                timer = null;

                // Brief grace period so if window was closed by script, postMessage has time to process
                setTimeout(async () => {
                  if (settled) return;
                  try {
                    const userData = await fetchUserProfile();
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
    [fetchUserProfile]
  );

  return { login, error };
};
