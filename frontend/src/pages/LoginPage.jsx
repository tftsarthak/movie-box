import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import {
  Film,
  ShieldCheck,
  Heart,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { TMDB_IMAGE_BASE_URL } from "@/lib/constants";

export const LoginPage = () => {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const status = searchParams.get("status");

  const statusAlert = useMemo(() => {
    switch (status) {
      case "denied":
        return {
          type: "warning",
          title: "Authorization Denied",
          description:
            "You chose not to grant MovieBox access on TMDB. You can connect anytime to unlock personal cloud sync.",
        };
      case "expired":
        return {
          type: "error",
          title: "Session Expired",
          description:
            "The authorization request has expired. Please initiate the connection again.",
        };
      case "invalid_state":
      case "session_failed":
      case "auth_failed":
        return {
          type: "error",
          title: "Authentication Error",
          description:
            "Could not complete the TMDB authentication handshake. Please check your connection and try again.",
        };
      case "logged_out":
        return {
          type: "success",
          title: "Logged Out",
          description: "You have been logged out of your TMDB session.",
        };
      default:
        return null;
    }
  }, [status]);

  const handleConnect = async () => {
    try {
      setIsSubmitting(true);
      await login();
    } catch (err) {
      console.error("Login initiation failed:", err);
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const avatarPath = user?.avatar?.tmdb?.avatar_path;
  const gravatarHash = user?.avatar?.gravatar?.hash;
  const avatarUrl = avatarPath
    ? `${TMDB_IMAGE_BASE_URL.profile}${avatarPath}`
    : gravatarHash
    ? `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`
    : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        {/* Status Feedback Banner */}
        {statusAlert && (
          <div
            className={`rounded-xl p-4 border flex items-start gap-3 transition-colors ${
              statusAlert.type === "error"
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : statusAlert.type === "warning"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
          >
            {statusAlert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-semibold text-sm mb-0.5">{statusAlert.title}</p>
              <p className="opacity-90 leading-relaxed">{statusAlert.description}</p>
            </div>
          </div>
        )}

        {/* Main Login / Profile Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-[#ff5757]/20 to-[#a1131a]/10 blur-3xl pointer-events-none" />

          {authLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Checking session status...</p>
            </div>
          ) : isAuthenticated ? (
            /* Already Connected State */
            <div className="space-y-6 text-center">
              <div className="relative mx-auto h-20 w-20">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || user?.username}
                    className="h-20 w-20 rounded-full object-cover border-2 border-primary/40 shadow-lg mx-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 text-primary flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
                    {(user?.username || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <Badge variant="outline" className="mb-2 text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                  Connected with TMDB
                </Badge>
                <h2 className="text-xl font-bold text-foreground">
                  {user?.name || user?.username}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">@{user?.username}</p>
              </div>

              <div className="pt-2 space-y-2.5">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full h-10 font-semibold text-xs rounded-lg shadow-sm"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full h-10 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Disconnect TMDB Session
                </Button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Connect State */
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5757] to-[#a1131a] text-white shadow-md">
                  <Film className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Connect to MovieBox
                </h1>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Seamlessly sync your watchlist and favorites across devices powered directly by your TMDB account.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5 text-foreground">
                  <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Sync and manage personal favorites</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <Bookmark className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Access your watchlist anywhere</span>
                </div>
                <div className="flex items-center gap-2.5 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Official TMDB OAuth — no passwords stored</span>
                </div>
              </div>

              {/* Connect CTA */}
              <div className="space-y-3 pt-1">
                <Button
                  onClick={handleConnect}
                  disabled={isSubmitting}
                  className="w-full h-11 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redirecting to TMDB...
                    </>
                  ) : (
                    <>
                      Connect with TMDB
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Don't have a TMDB account yet?{" "}
                  <a
                    href="https://www.themoviedb.org/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-foreground hover:text-primary transition-colors font-medium"
                  >
                    Sign up on TMDB
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
