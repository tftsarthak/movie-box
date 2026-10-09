import { Link } from "react-router";
import { Star, Info, Flame, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_BACKDROP } from "@/lib/constants";

export const HeroBanner = ({ movie, isLoading = false }) => {
  if (isLoading) {
    return <HeroBannerSkeleton />;
  }

  if (!movie) return null;

  const id = movie.id || movie._id;
  const title = movie.title || movie.name || "Untitled";
  const backdropPath = movie.backdrop_path || movie.backdropPath;
  const releaseDate = movie.release_date || movie.releaseDate;
  const voteAverage = movie.vote_average ?? movie.voteAverage;
  const overview = movie.overview || "No synopsis available.";

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating =
    typeof voteAverage === "number" && voteAverage > 0
      ? voteAverage.toFixed(1)
      : null;

  const backdropUrl = backdropPath
    ? `${TMDB_IMAGE_BASE_URL.backdropOriginal}${backdropPath}`
    : PLACEHOLDER_BACKDROP;

  return (
    <div className="relative w-full min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] flex items-end overflow-hidden">
      {/* Background image */}
      <img
        src={backdropUrl}
        alt={title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = PLACEHOLDER_BACKDROP;
        }}
        className="absolute inset-0 h-full w-full object-cover object-center scale-105 filter brightness-90 animate-fade-in"
      />

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-3/4" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-background/40 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 pt-24">
        <div className="max-w-2xl space-y-4">
          {/* Spotlight tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs font-semibold text-rose-400 backdrop-blur-md shadow-sm">
            <Flame className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
            <span>Featured Spotlight</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md line-clamp-2">
            {title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-zinc-300">
            {rating && (
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} Rating</span>
              </div>
            )}
            {year && (
              <div className="flex items-center gap-1 text-zinc-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                <Calendar className="h-3.5 w-3.5" />
                <span>{year}</span>
              </div>
            )}
            {movie.original_language && (
              <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[11px] font-semibold text-zinc-300">
                {movie.original_language}
              </span>
            )}
          </div>

          {/* Overview excerpt */}
          <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed line-clamp-3 max-w-xl font-normal drop-shadow-sm">
            {overview}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Link to={`/movie/${id}`} className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                View Details
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full bg-card/60 backdrop-blur-md border-border/80 hover:bg-card/90 text-foreground transition-all hover:scale-105 cursor-pointer"
            >
              <Link to="/discover">Explore All</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeroBannerSkeleton = () => {
  return (
    <div className="relative w-full min-h-[460px] sm:min-h-[540px] lg:min-h-[620px] flex items-end bg-muted/40 animate-pulse border-b border-border/40">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-4">
        <div className="h-6 w-36 rounded-full bg-muted/60" />
        <div className="h-12 w-3/4 max-w-lg rounded-lg bg-muted/70" />
        <div className="h-5 w-48 rounded bg-muted/50" />
        <div className="space-y-2 max-w-xl">
          <div className="h-4 w-full rounded bg-muted/40" />
          <div className="h-4 w-5/6 rounded bg-muted/40" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-11 w-36 rounded-full bg-muted/70" />
          <div className="h-11 w-32 rounded-full bg-muted/50" />
        </div>
      </div>
    </div>
  );
};
