import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SearchX, X, Loader2, Sparkles, Flame, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchMovies, useTrendingMovies } from "@/hooks/queries/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/movie/MovieCard";
import { PaginationBar } from "@/components/movie/PaginationBar";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TMDB_IMAGE_BASE_URL } from "@/lib/constants";

/** TMDB maximum page ceiling */
const MAX_PAGE = 500;

/** Popular quick search suggestions when no query has been entered */
const POPULAR_SUGGESTIONS = [
  { label: "Oppenheimer", icon: Flame },
  { label: "Dune", icon: Film },
  { label: "Interstellar", icon: Sparkles },
  { label: "Spider-Man", icon: Film },
  { label: "Inception", icon: Sparkles },
  { label: "The Dark Knight", icon: Film },
  { label: "Avengers", icon: Flame },
  { label: "Avatar", icon: Sparkles },
];

/**
 * Sanitize the page parameter from URL search params.
 * Clamps to [1, 500] and defaults to 1 for invalid values.
 */
const sanitizePage = (raw) => {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, MAX_PAGE);
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

// ─── SearchPage Component ───────────────────────────────────────────────────
export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Read URL search state
  const rawQuery = searchParams.get("q") ?? "";
  const rawPage = searchParams.get("page");
  const currentPage = sanitizePage(rawPage);

  // ── Controlled draft query with debounce ──────────────────────────────────
  const [prevUrlQuery, setPrevUrlQuery] = useState(rawQuery);
  const [draftQuery, setDraftQuery] = useState(rawQuery);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Sync draft when URL changes externally (back/forward nav or suggestion click)
  if (prevUrlQuery !== rawQuery) {
    setPrevUrlQuery(rawQuery);
    setDraftQuery(rawQuery);
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── URL param updater ─────────────────────────────────────────────────────
  const commitSearch = (newQuery, newPage = 1) => {
    const trimmed = newQuery.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set("q", trimmed);
          if (newPage > 1) {
            next.set("page", String(newPage));
          } else {
            next.delete("page");
          }
        } else {
          next.delete("q");
          next.delete("page");
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDraftQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commitSearch(val, 1);
    }, 350);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitSearch(draftQuery, 1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraftQuery("");
    commitSearch("", 1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (keyword) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraftQuery(keyword);
    commitSearch(keyword, 1);
  };

  const handlePageChange = (page) => {
    commitSearch(rawQuery, page);
  };

  // ── Queries ───────────────────────────────────────────────────────────────
  const searchQuery = useSearchMovies(rawQuery, currentPage);
  const trendingQuery = useTrendingMovies("day");

  const movies = searchQuery.data?.results ?? [];
  const trendingMovies = trendingQuery.data ?? [];
  const totalPages = searchQuery.data?.total_pages ?? 0;
  const totalResults = searchQuery.data?.total_results ?? 0;
  const hasQuery = Boolean(rawQuery.trim());

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

  // ── Smooth scroll to top on page change ───────────────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ── Animation Variants ────────────────────────────────────────────────────
  const containerMotion = prefersReducedMotion
    ? containerVariantsReduced
    : containerVariants;
  const itemMotion = prefersReducedMotion
    ? itemVariantsReduced
    : itemVariants;

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
                opacity: hasQuery ? 0.08 : 0.22,
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
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold mb-3 backdrop-blur-md shadow-xs">
            <Film className="h-3.5 w-3.5" />
            <span>Movie Explorer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-3 drop-shadow-sm">
            Search Movies
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find your favorite films by title, franchise, or keyword across TMDB.
          </p>
        </div>

        {/* Search Input Bar with Ambient Glow */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-rose-500/20 to-primary/30 opacity-50 blur-xl transition-all pointer-events-none" />

          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center shadow-2xl rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary"
          >
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />

            <input
              ref={inputRef}
              type="text"
              value={draftQuery}
              onChange={handleInputChange}
              placeholder="Search by movie title, actor, or franchise..."
              maxLength={100}
              className="w-full h-13 pl-12 pr-28 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none font-medium"
              aria-label="Search movies"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery.isFetching && hasQuery && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}

              {draftQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <Button
                type="submit"
                size="sm"
                className="h-9 px-4 text-xs font-semibold cursor-pointer rounded-xl"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Content Area */}
        {!hasQuery ? (
          /* Welcome / Idle State with Suggestions & Trending Showcase */
          <div className="space-y-12">
            <div className="max-w-xl mx-auto text-center py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Popular Searches
              </h2>

              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.label)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-border/80 bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/80 backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Icon className="h-3 w-3 text-primary" />
                      <span>{suggestion.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Right Now Showcase */}
            {trendingMovies.length > 0 && (
              <div className="pt-6 border-t border-border/60">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Flame className="h-4 w-4 fill-rose-500" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                        Trending Right Now
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Most popular movies across TMDB today
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                  {trendingMovies.slice(0, 10).map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : searchQuery.isLoading ? (
          /* Loading Skeleton Grid */
          <SkeletonGrid />
        ) : searchQuery.isError ? (
          /* Error State */
          <ErrorState
            title="Could not complete search"
            message={
              searchQuery.error?.message ||
              "Failed to fetch search results from TMDB. Please try again."
            }
            onRetry={() => searchQuery.refetch()}
          />
        ) : movies.length === 0 ? (
          /* Empty Results State */
          <EmptyState
            icon={SearchX}
            title={`No results for "${rawQuery}"`}
            message="We couldn't find any movies matching your search term. Try checking for typos or searching for a different keyword."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-xs border-border bg-card hover:bg-muted cursor-pointer"
              >
                Clear Search
              </Button>
            }
          />
        ) : (
          /* Success State */
          <>
            {/* Results Summary Bar */}
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  Results for
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-2.5 py-0.5 border-border bg-card text-foreground"
                >
                  &ldquo;{rawQuery}&rdquo;
                </Badge>
              </div>

              <span className="text-xs text-muted-foreground font-medium">
                {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Movie Grid with Staggered Framer Motion */}
            <motion.div
              key={`${rawQuery}-${currentPage}`}
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

            {/* Floating Overlay Pagination Bar */}
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isFetching={searchQuery.isFetching}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
