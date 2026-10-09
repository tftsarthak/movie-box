import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";

export const MovieCarousel = ({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  viewAllHref,
  className = "",
}) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [movies, isLoading]);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`py-6 relative ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors mr-2"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Carousel scroll controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`p-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm text-foreground transition-all duration-200 ${
                canScrollLeft
                  ? "hover:bg-accent hover:border-primary/50 text-foreground cursor-pointer shadow-sm"
                  : "opacity-30 cursor-not-allowed text-muted-foreground"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`p-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm text-foreground transition-all duration-200 ${
                canScrollRight
                  ? "hover:bg-accent hover:border-primary/50 text-foreground cursor-pointer shadow-sm"
                  : "opacity-30 cursor-not-allowed text-muted-foreground"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
        >
          {isLoading ? (
            // Skeleton loader row
            Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[140px] sm:w-[170px] md:w-[190px] flex-none"
              >
                <MovieCardSkeleton />
              </div>
            ))
          ) : movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="w-[140px] sm:w-[170px] md:w-[190px] flex-none"
              >
                <MovieCard movie={movie} />
              </div>
            ))
          ) : (
            <div className="w-full py-8 text-center text-sm text-muted-foreground">
              No movies to display
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
