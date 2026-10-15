import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Heart,
  Bookmark,
  Compass,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { TMDB_IMAGE_BASE_URL } from "@/lib/constants";

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const avatarPath = user?.avatar?.tmdb?.avatar_path;
  const gravatarHash = user?.avatar?.gravatar?.hash;
  const avatarUrl = avatarPath
    ? `${TMDB_IMAGE_BASE_URL.profile}${avatarPath}`
    : gravatarHash
    ? `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`
    : null;

  const displayName = user?.name?.trim() || user?.username || "Account";
  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Profile Spotlight Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-md p-6 sm:p-8 shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#ff5757]/15 to-[#a1131a]/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-24 w-24 rounded-full object-cover border-2 border-primary/30 shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 text-primary font-bold text-3xl shadow-sm">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            {/* Profile Meta Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {displayName}
                </h1>
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-semibold"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  TMDB Verified
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                @{user?.username} • TMDB ID:{" "}
                <span className="font-mono text-foreground font-semibold">
                  #{user?.id}
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                {user?.iso_3166_1 && <span>Region: {user.iso_3166_1}</span>}
                {user?.iso_639_1 && <span>Language: {user.iso_639_1.toUpperCase()}</span>}
                <span>
                  Adult Content: {user?.include_adult ? "Allowed" : "Filtered"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://www.themoviedb.org/u/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border bg-card hover:bg-muted"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  TMDB Profile
                </Button>
              </a>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Access Sections */}
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
            Your Movie Hub
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Favorites Card */}
            <Link
              to="/favorites"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5 fill-rose-500/20" />
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Cloud Synced
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-rose-500 transition-colors">
                Favorite Movies & Shows
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Browse and manage all the cinema you've loved and marked on TMDB.
              </p>
            </Link>

            {/* Watchlist Card */}
            <Link
              to="/watchlist"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Bookmark className="h-5 w-5 fill-amber-500/20" />
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Saved Films
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                Your Watchlist
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Films and series you have queued up for your next movie night.
              </p>
            </Link>

            {/* Discover Card */}
            <Link
              to="/discover"
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Compass className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Explore
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                Discover More Films
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Filter by genre, release year, or rating to find your next favorite film.
              </p>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
