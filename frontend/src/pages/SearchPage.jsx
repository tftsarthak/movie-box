import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Search, SearchX, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchMovies } from "@/hooks/queries/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/movie/MovieCard";
import { PaginationBar } from "@/components/movie/PaginationBar";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

/** TMDB maximum page ceiling */
const MAX_PAGE = 500;

/** Popular quick search suggestions when no query has been entered */
const POPULAR_SUGGESTIONS = [
  "Inception",
  "Oppenheimer",
  "Dune",
  "Interstellar",
  "Spider-Man",
  "The Dark Knight",
  "Avengers",
  "Avatar",
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

  // ── Query ─────────────────────────────────────────────────────────────────
  const searchQuery = useSearchMovies(rawQuery, currentPage);
  const movies = searchQuery.data?.results ?? [];
  const totalPages = searchQuery.data?.total_pages ?? 0;
  const totalResults = searchQuery.data?.total_results ?? 0;
  const hasQuery = Boolean(rawQuery.trim());

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
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Search Movies
        </h1>
        <p className="text-sm text-muted-foreground">
          Find your favorite films by title, franchise, or keyword across TMDB.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center shadow-sm rounded-xl border border-border bg-card/80 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary"
        >
          <Search className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />

          <input
            ref={inputRef}
            type="text"
            value={draftQuery}
            onChange={handleInputChange}
            placeholder="Search by movie title, actor, or franchise..."
            maxLength={100}
            className="w-full h-12 pl-11 pr-24 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Search movies"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {searchQuery.isFetching && hasQuery && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {draftQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 text-xs font-semibold cursor-pointer"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Content Area */}
      {!hasQuery ? (
        /* Welcome / Idle State with Suggestions */
        <div className="max-w-xl mx-auto text-center py-10 sm:py-14">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-muted/70 border border-border text-primary mb-4 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1.5">
            Explore the Movie Catalog
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Type a title into the search bar above or choose one of these popular suggestions to get started:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card/80 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/80 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
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
                className="text-xs font-semibold px-2 py-0.5 border-border bg-card text-foreground"
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
  );
};

export default SearchPage;
