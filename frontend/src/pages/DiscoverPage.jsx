import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SearchX, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useMovieGenres,
  useDiscoverMovies,
  useTrendingMovies,
} from "@/hooks/queries/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/movie/MovieCard";
import { FilterBar } from "@/components/movie/FilterBar";
import { PaginationBar } from "@/components/movie/PaginationBar";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TMDB_IMAGE_BASE_URL } from "@/lib/constants";

/** Default sort when none is specified in the URL */
const DEFAULT_SORT = "popularity.desc";

/** TMDB hard ceiling for pages */
const MAX_PAGE = 500;

/** Valid TMDB sort keys accepted by the backend */
const VALID_SORTS = new Set([
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
  "revenue.desc",
]);

/**
 * Sanitize the page parameter from URL search params.
 * Clamps to [1, 500] and defaults to 1 for invalid values.
 */
const sanitizePage = (raw) => {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, MAX_PAGE);
};

/**
 * Sanitize the sort_by parameter from URL search params.
 * Falls back to popularity.desc for unrecognized values.
 */
const sanitizeSort = (raw) => {
  return VALID_SORTS.has(raw) ? raw : DEFAULT_SORT;
};

// ─── Framer Motion Variants ─────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const containerVariantsReduced = {
  hidden: {},
  visible: {},
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};

// ─── Skeleton Grid (Loading State) ──────────────────────────────────────────
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
    {Array.from({ length: 20 }, (_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
);

// ─── DiscoverPage ───────────────────────────────────────────────────────────
export const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // ── Read & sanitize URL params ──────────────────────────────────────────
  const selectedGenre = searchParams.get("genre") || "";
  const selectedYear = searchParams.get("year") || "";
  const selectedSort = sanitizeSort(searchParams.get("sort_by"));
  const currentPage = sanitizePage(searchParams.get("page"));

  // ── Build filters object (stable reference via URL-driven values) ───────
  const filters = {};
  if (selectedGenre) filters.genre = selectedGenre;
  if (selectedYear) filters.year = selectedYear;
  if (selectedSort !== DEFAULT_SORT) filters.sortBy = selectedSort;

  // ── Queries ─────────────────────────────────────────────────────────────
  const genresQuery = useMovieGenres();
  const discoverQuery = useDiscoverMovies(filters, currentPage);
  const trendingQuery = useTrendingMovies("day");

  const genres = genresQuery.data ?? [];
  const movies = discoverQuery.data?.results ?? [];
  const trendingMovies = trendingQuery.data ?? [];
  const totalPages = discoverQuery.data?.total_pages ?? 0;
  const totalResults = discoverQuery.data?.total_results;

  const hasActiveFilters =
    selectedGenre !== "" ||
    selectedYear !== "" ||
    selectedSort !== DEFAULT_SORT;

  // ── Ambient Background Crossfade ──────────────────────────────────────────
  const backdropCandidates = trendingMovies.filter((m) => Boolean(m.backdrop_path));
  const [backdropIndex, setBackdropIndex] = useState(0);

  useEffect(() => {
    if (backdropCandidates.length <= 1) return;
    const timer = setInterval(() => {
      setBackdropIndex((prev) => (prev + 1) % Math.min(backdropCandidates.length, 6));
    }, 7000);
    return () => clearInterval(timer);
  }, [backdropCandidates.length]);

  const currentBackdropPath = backdropCandidates[backdropIndex]?.backdrop_path;
  const currentBackdropUrl = currentBackdropPath
    ? `${TMDB_IMAGE_BASE_URL.backdropOriginal}${currentBackdropPath}`
    : null;

  // ── URL param updaters ──────────────────────────────────────────────────
  const updateParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value == null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      // Reset to page 1 when filters change (not when page itself changes)
      if (!("page" in updates)) {
        next.delete("page");
      }

      return next;
    }, { replace: true });
  };

  const handleGenreChange = (genreId) => updateParams({ genre: genreId });
  const handleYearChange = (year) => updateParams({ year });
  const handleSortChange = (sortKey) => updateParams({ sort_by: sortKey });
  const handlePageChange = (page) => updateParams({ page: String(page) });

  const handleReset = () => {
    setSearchParams({}, { replace: true });
  };

  // Smooth scroll to top whenever currentPage changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ── Select motion variants based on reduced-motion preference ───────────
  const containerMotion = prefersReducedMotion
    ? containerVariantsReduced
    : containerVariants;
  const itemMotion = prefersReducedMotion
    ? itemVariantsReduced
    : itemVariants;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Dynamic Ambient Cinematic Backdrop ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          {currentBackdropUrl && (
            <motion.img
              key={currentBackdropUrl}
              src={currentBackdropUrl}
              alt=""
              aria-hidden="true"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
              animate={{
                opacity: 0.12,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover object-center filter brightness-90 saturate-125 select-none"
            />
          )}
        </AnimatePresence>

        {/* Cinematic Vignettes & Radial Glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(225,29,72,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(0,0,0,0.85),transparent)]" />
      </div>

      {/* ── Foreground Main Container ──────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold mb-3 backdrop-blur-md shadow-xs">
            <Compass className="h-3.5 w-3.5" />
            <span>Catalog Explorer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-3 drop-shadow-sm">
            Discover Movies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore thousands of titles by genre, release year, or sort by popularity and rating.
          </p>
        </div>

        {/* Filter Bar with Ambient Glow */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-rose-500/15 to-primary/20 opacity-40 blur-xl transition-all pointer-events-none" />
          <div className="relative">
            <FilterBar
              genres={genres}
              selectedGenre={selectedGenre}
              selectedYear={selectedYear}
              selectedSort={selectedSort}
              onGenreChange={handleGenreChange}
              onYearChange={handleYearChange}
              onSortChange={handleSortChange}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
              isFetching={discoverQuery.isFetching && !discoverQuery.isLoading}
              totalResults={totalResults}
            />
          </div>
        </div>

        {/* Active Filter Indicators Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-5 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">
                Active:
              </span>
              {selectedGenre && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2 py-0.5 border-border bg-card text-foreground"
                >
                  Genre: {genres.find((g) => String(g.id) === selectedGenre)?.name || selectedGenre}
                </Badge>
              )}
              {selectedYear && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2 py-0.5 border-border bg-card text-foreground"
                >
                  Year: {selectedYear}
                </Badge>
              )}
              {selectedSort !== DEFAULT_SORT && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium px-2 py-0.5 border-border bg-card text-foreground"
                >
                  Sort: {selectedSort.replace(".desc", "").replace("_", " ")}
                </Badge>
              )}
            </div>

            {totalResults != null && (
              <span className="text-xs text-muted-foreground font-medium ml-auto">
                {totalResults.toLocaleString()} title{totalResults !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Content Area */}
        {discoverQuery.isLoading ? (
          <SkeletonGrid />
        ) : discoverQuery.isError ? (
          <ErrorState
            title="Could not load movies"
            message={
              discoverQuery.error?.message ||
              "Failed to fetch discover results. Please try again."
            }
            onRetry={() => discoverQuery.refetch()}
          />
        ) : movies.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No movies found"
            message={
              hasActiveFilters
                ? "No movies match your current filters. Try adjusting or resetting them."
                : "No movies available at this time. Please try again later."
            }
            action={
              hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs border-border bg-card hover:bg-muted cursor-pointer"
                >
                  Reset Filters
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            {/* Movie Grid with Stagger Animation */}
            <motion.div
              key={`${selectedGenre}-${selectedYear}-${selectedSort}-${currentPage}`}
              variants={containerMotion}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5"
            >
              {movies.map((movie) => (
                <motion.div key={movie.id} variants={itemMotion}>
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isFetching={discoverQuery.isFetching}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
