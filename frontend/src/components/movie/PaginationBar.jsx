import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Maximum page limit enforced by TMDB API */
const TMDB_MAX_PAGE = 500;

/**
 * PaginationBar — Previous, Next, page indicator, and first/last navigation.
 *
 * @param {object} props
 * @param {number} props.currentPage - Active page (1-indexed)
 * @param {number} props.totalPages - Total pages from TMDB (clamped to 500)
 * @param {(newPage: number) => void} props.onPageChange
 * @param {boolean} [props.disabled]
 */
export const PaginationBar = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) => {
  const maxPage = Math.min(totalPages, TMDB_MAX_PAGE);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= maxPage;

  const handlePageChange = (page) => {
    const clamped = Math.max(1, Math.min(page, maxPage));
    if (clamped !== currentPage) {
      onPageChange(clamped);
      // Smooth scroll to top of results
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (maxPage <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 pt-8 pb-4"
    >
      {/* First Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(1)}
        disabled={disabled || isFirstPage}
        aria-label="Go to first page"
        className="h-9 w-9 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || isFirstPage}
        aria-label="Go to previous page"
        className="h-9 w-9 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Indicator */}
      <div className="flex items-center gap-1 px-3 h-9 rounded-lg border border-border bg-card text-sm select-none">
        <span className="font-semibold text-foreground">{currentPage}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{maxPage.toLocaleString()}</span>
      </div>

      {/* Next Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || isLastPage}
        aria-label="Go to next page"
        className="h-9 w-9 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(maxPage)}
        disabled={disabled || isLastPage}
        aria-label="Go to last page"
        className="h-9 w-9 border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
