import { useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Users,
  Building2,
  DollarSign,
  Globe,
  Film,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  useMovieDetails,
  useMovieCredits,
  useSimilarMovies,
} from "@/hooks/queries/movies";
import {
  useMovieAccountState,
  useToggleFavoriteMutation,
  useToggleWatchlistMutation,
} from "@/hooks/queries/account";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import { ErrorState } from "@/components/common/ErrorState";
import {
  TMDB_IMAGE_BASE_URL,
  PLACEHOLDER_BACKDROP,
  PLACEHOLDER_POSTER,
} from "@/lib/constants";

// ─── Formatting Helpers ─────────────────────────────────────────────────────

/** Formats movie runtime minutes to "Xh Ym" string */
const formatRuntime = (minutes) => {
  if (!minutes || minutes <= 0) return "Runtime unavailable";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/** Formats numbers to USD currency e.g. "$165,000,000" */
const formatCurrency = (amount) => {
  if (!amount || amount <= 0) return "Not disclosed";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Loading Skeleton Component ─────────────────────────────────────────────
const MovieDetailSkeleton = () => (
  <div className="min-h-screen pb-20 animate-pulse">
    {/* Hero Banner Skeleton */}
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[580px] bg-muted/40">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 relative z-10">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
        {/* Poster Skeleton */}
        <div className="w-56 sm:w-64 lg:w-72 shrink-0 aspect-[2/3] rounded-2xl bg-muted border border-border/60 shadow-xl" />

        {/* Text Skeleton */}
        <div className="flex-1 space-y-4 pt-4 sm:pt-12">
          <div className="h-4 w-28 rounded-md bg-muted" />
          <div className="h-10 w-3/4 rounded-lg bg-muted" />
          <div className="h-4 w-1/2 rounded-md bg-muted" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-4/6 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── MovieDetailPage Component ──────────────────────────────────────────────
export const MovieDetailPage = () => {
  const { tmdbId } = useParams();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const castScrollRef = useRef(null);

  // Parameter validation
  const isValidId = Boolean(tmdbId && /^\d+$/.test(String(tmdbId)));

  // ── Queries ───────────────────────────────────────────────────────────────
  const { isAuthenticated } = useAuth();
  const movieQuery = useMovieDetails(tmdbId);
  const creditsQuery = useMovieCredits(tmdbId);
  const similarQuery = useSimilarMovies(tmdbId);
  const accountStateQuery = useMovieAccountState(tmdbId, {
    enabled: isAuthenticated && isValidId,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const toggleFavorite = useToggleFavoriteMutation();
  const toggleWatchlist = useToggleWatchlistMutation();

  const isFavorite = accountStateQuery.data?.favorite ?? false;
  const isWatchlist = accountStateQuery.data?.watchlist ?? false;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast("Connect TMDB in profile to add movies to your favorites", {
        icon: "ℹ️",
      });
      return;
    }
    toggleFavorite.mutate({ movieId: tmdbId, favorite: !isFavorite });
  };

  const handleToggleWatchlist = () => {
    if (!isAuthenticated) {
      toast("Connect TMDB in profile to add movies to your watchlist", {
        icon: "ℹ️",
      });
      return;
    }
    toggleWatchlist.mutate({ movieId: tmdbId, watchlist: !isWatchlist });
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Movie link copied to clipboard!");
      }
    } catch {
      toast.error("Could not copy link");
    }
  };

  const scrollCast = (direction) => {
    const el = castScrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // ── Validation Guards ─────────────────────────────────────────────────────
  if (!isValidId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ErrorState
          title="Invalid Movie ID"
          message="The requested movie identifier is not valid."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/discover")}
              className="border-border bg-card hover:bg-muted"
            >
              Browse Movies
            </Button>
          }
        />
      </div>
    );
  }

  if (movieQuery.isLoading) {
    return <MovieDetailSkeleton />;
  }

  if (movieQuery.isError || !movieQuery.data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ErrorState
          title="Movie Not Found"
          message={
            movieQuery.error?.message ||
            "We were unable to load details for this title from TMDB."
          }
          onRetry={() => movieQuery.refetch()}
        />
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ── Data Destructuring ────────────────────────────────────────────────────
  const movie = movieQuery.data;
  const credits = creditsQuery.data;
  const similarMovies = similarQuery.data ?? [];

  const title = movie.title || movie.name || "Untitled";
  const tagline = movie.tagline;
  const overview = movie.overview || "No synopsis available for this title.";
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;
  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;
  const voteCount = movie.vote_count ?? 0;
  const runtimeFormatted = formatRuntime(movie.runtime);
  const genres = movie.genres || [];

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL.backdropOriginal}${movie.backdrop_path}`
    : PLACEHOLDER_BACKDROP;

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL.poster}${movie.poster_path}`
    : PLACEHOLDER_POSTER;

  // Key Crew Members
  const castList = credits?.cast || [];
  const crewList = credits?.crew || [];
  const directors = crewList.filter((c) => c.job === "Director");
  const writers = crewList.filter((c) =>
    ["Screenplay", "Writer", "Story"].includes(c.job)
  );

  return (
    <div className="min-h-screen pb-24">
      {/* ── Cinematic Hero Banner ────────────────────────────────────────── */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={backdropUrl}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_BACKDROP;
          }}
          className="absolute inset-0 h-full w-full object-cover object-center scale-105 filter brightness-75 select-none"
        />

        {/* Cinematic Multi-Stop Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent sm:w-2/3" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/50 pointer-events-none" />

        {/* Back Button Floating on Hero */}
        <div className="absolute top-6 left-4 sm:left-6 lg:left-8 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 px-3 rounded-full bg-background/60 hover:bg-background/90 backdrop-blur-md border border-border/60 text-xs font-medium text-foreground transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back
          </Button>
        </div>
      </div>

      {/* ── Foreground Movie Header & Poster ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 lg:-mt-60 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Left: Poster Card & Personal Action Buttons */}
          <div className="w-48 sm:w-60 lg:w-72 shrink-0 mx-auto md:mx-0 space-y-4">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl"
            >
              <img
                src={posterUrl}
                alt={title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PLACEHOLDER_POSTER;
                }}
                className="h-full w-full object-cover select-none"
              />
            </motion.div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-2 pt-1">
              {/* Favorite Button */}
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={handleToggleFavorite}
                disabled={toggleFavorite.isPending}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isFavorite
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                    : "border-border bg-card/80 hover:bg-muted/80 text-foreground"
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-4 w-4 mr-1.5 transition-transform ${
                    isFavorite ? "fill-white text-white scale-110" : "text-rose-500"
                  }`}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>

              {/* Watchlist Button */}
              <Button
                variant={isWatchlist ? "default" : "outline"}
                size="sm"
                onClick={handleToggleWatchlist}
                disabled={toggleWatchlist.isPending}
                className={`flex-1 h-9 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isWatchlist
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border bg-card/80 hover:bg-muted/80 text-foreground"
                }`}
                aria-label={isWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                <Bookmark
                  className={`h-4 w-4 mr-1.5 transition-transform ${
                    isWatchlist ? "fill-current scale-110" : "text-primary"
                  }`}
                />
                {isWatchlist ? "Watchlisted" : "Watchlist"}
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="h-9 w-9 rounded-xl border-border bg-card/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                aria-label="Share movie link"
                title="Copy movie link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Title, Metrics, Genres, Overview */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex-1 space-y-4 pt-2 md:pt-16"
          >
            {/* Title & Tagline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {title}
              </h1>
              {tagline && (
                <p className="text-sm sm:text-base italic text-muted-foreground mt-1.5">
                  &ldquo;{tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground pt-1">
              {rating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{rating}</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({voteCount.toLocaleString()})
                  </span>
                </div>
              )}

              {releaseYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{releaseYear}</span>
                </div>
              )}

              <span>•</span>

              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{runtimeFormatted}</span>
              </div>

              {movie.status && (
                <>
                  <span>•</span>
                  <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0 border-border bg-muted/50 text-foreground"
                  >
                    {movie.status}
                  </Badge>
                </>
              )}
            </div>

            {/* Genre Badges */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genres.map((g) => (
                  <Link key={g.id} to={`/discover?genre=${g.id}`}>
                    <Badge
                      variant="secondary"
                      className="px-2.5 py-0.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Overview Section */}
            <div className="space-y-2 pt-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Overview
              </h2>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {overview}
              </p>
            </div>

            {/* Key Crew Callout */}
            {(directors.length > 0 || writers.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                {directors.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">
                      Director{directors.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {directors.map((d) => d.name).join(", ")}
                    </span>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block">
                      Screenplay / Writer{writers.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {writers.map((w) => w.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <Separator className="my-10" />

        {/* ── Main Content: Cast & Specifications ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column (2 cols on lg): Top Billed Cast */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Top Billed Cast
                </h2>
              </div>
              {castList.length > 4 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCast("left")}
                    className="h-8 w-8 rounded-full border-border bg-card hover:bg-muted cursor-pointer"
                    aria-label="Scroll cast left"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scrollCast("right")}
                    className="h-8 w-8 rounded-full border-border bg-card hover:bg-muted cursor-pointer"
                    aria-label="Scroll cast right"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </Button>
                </div>
              )}
            </div>

            {/* Cast Horizontal Scrollable List */}
            {castList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cast information available.
              </p>
            ) : (
              <div
                ref={castScrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3"
              >
                {castList.slice(0, 16).map((actor) => {
                  const profileUrl = actor.profile_path
                    ? `${TMDB_IMAGE_BASE_URL.profile}${actor.profile_path}`
                    : null;

                  return (
                    <div
                      key={actor.id}
                      className="w-32 sm:w-36 shrink-0 rounded-xl border border-border bg-card p-2 text-center transition-all hover:border-primary/40 shadow-xs"
                    >
                      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-muted mb-2">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={actor.name}
                            loading="lazy"
                            className="h-full w-full object-cover select-none"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            <Film className="h-6 w-6 opacity-40" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-foreground truncate" title={actor.name}>
                        {actor.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate" title={actor.character}>
                        {actor.character || "Role undisclosed"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Specifications Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Movie Facts
                </h3>
              </div>

              {/* Status */}
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Status
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {movie.status || "Unknown"}
                </span>
              </div>

              {/* Original Language */}
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Original Language
                </span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{movie.original_language?.toUpperCase() || "N/A"}</span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Budget
                </span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatCurrency(movie.budget)}</span>
                </div>
              </div>

              {/* Revenue */}
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Revenue
                </span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatCurrency(movie.revenue)}</span>
                </div>
              </div>

              {/* Production Companies */}
              {movie.production_companies?.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium block mb-1.5">
                    Production Companies
                  </span>
                  <div className="space-y-1">
                    {movie.production_companies.slice(0, 3).map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center gap-1.5 text-xs text-foreground font-medium"
                      >
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{comp.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              {(movie.imdb_id || movie.homepage) && (
                <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                  {movie.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                    >
                      <span>IMDb</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {movie.homepage && (
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-muted/60 text-foreground hover:bg-muted transition-colors"
                    >
                      <span>Official Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Similar Movies Carousel ──────────────────────────────────── */}
        {similarMovies.length > 0 && (
          <div className="mt-14">
            <MovieCarousel
              title="Similar Movies"
              subtitle="More titles you might enjoy"
              movies={similarMovies}
              isLoading={similarQuery.isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
