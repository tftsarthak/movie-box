import { Link } from "react-router";
import { Star } from "lucide-react";
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_POSTER } from "@/lib/constants";

export const MovieCard = ({ movie, className = "" }) => {
  if (!movie) return null;

  const id = movie.id || movie._id;
  const title = movie.title || movie.name || "Untitled";
  const posterPath = movie.poster_path || movie.posterPath;
  const releaseDate = movie.release_date || movie.releaseDate;
  const voteAverage = movie.vote_average ?? movie.voteAverage;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const formattedRating =
    typeof voteAverage === "number" && voteAverage > 0
      ? voteAverage.toFixed(1)
      : null;

  const posterUrl = posterPath
    ? `${TMDB_IMAGE_BASE_URL.poster}${posterPath}`
    : PLACEHOLDER_POSTER;

  return (
    <Link
      to={`/movie/${id}`}
      aria-label={`View details for ${title}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted/40 border border-border/50 shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER_POSTER;
          }}
          className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
        />

        {/* Cinematic gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3 pointer-events-none">
          <span className="text-xs font-medium text-white/90 line-clamp-2">
            {movie.overview || "Click to view full details & cast"}
          </span>
        </div>

        {/* Rating badge */}
        {formattedRating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-md border border-white/10 shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{formattedRating}</span>
          </div>
        )}
      </div>

      {/* Meta info below card */}
      <div className="mt-2.5 px-0.5 flex flex-col">
        <h3
          title={title}
          className="text-sm font-semibold text-foreground line-clamp-1 transition-colors duration-200 group-hover:text-primary"
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
          <span>{year || "Year N/A"}</span>
          {formattedRating && (
            <span className="flex items-center gap-1 sm:hidden">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
              {formattedRating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export const MovieCardSkeleton = ({ className = "" }) => {
  return (
    <div className={`flex flex-col animate-pulse ${className}`}>
      <div className="aspect-[2/3] w-full rounded-xl bg-muted/60 border border-border/40" />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-4 w-3/4 rounded bg-muted/60" />
        <div className="h-3 w-1/3 rounded bg-muted/40" />
      </div>
    </div>
  );
};
