import { useSearchParams } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMovieGenres, useDiscoverMovies } from "@/hooks/queries/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/movie/MovieCard";
import { FilterBar } from "@/components/movie/FilterBar";
import { PaginationBar } from "@/components/movie/PaginationBar";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

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

  const genres = genresQuery.data ?? [];
  const movies = discoverQuery.data?.results ?? [];
  const totalPages = discoverQuery.data?.total_pages ?? 0;
  const totalResults = discoverQuery.data?.total_results;

  const hasActiveFilters =
    selectedGenre !== "" ||
    selectedYear !== "" ||
    selectedSort !== DEFAULT_SORT;

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

  // ── Select motion variants based on reduced-motion preference ───────────
  const containerMotion = prefersReducedMotion
    ? containerVariantsReduced
    : containerVariants;
  const itemMotion = prefersReducedMotion
    ? itemVariantsReduced
    : itemVariants;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Discover Movies
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore the catalog by genre, release year, or sort by popularity and
          rating.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
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
                className="text-xs border-border bg-card hover:bg-muted"
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
            disabled={discoverQuery.isFetching}
          />
        </>
      )}
    </div>
  );
};

export default DiscoverPage;
