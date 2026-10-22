import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Maximum page limit enforced by TMDB API */
const TMDB_MAX_PAGE = 500;

/**
 * PaginationBar — Floating overlay pagination with direct page jump input,
 * first/last navigation, and rapid multi-click support.
 *
 * @param {object} props
 * @param {number} props.currentPage - Active page (1-indexed)
 * @param {number} props.totalPages - Total pages from TMDB (clamped to 500)
 * @param {(newPage: number) => void} props.onPageChange
 * @param {boolean} [props.isFetching] - Background fetching indicator
 * @param {boolean} [props.disabled] - Completely disable all controls
 * @param {string} [props.className] - Optional custom class
 */
export const PaginationBar = ({
  currentPage,
  totalPages,
  onPageChange,
  isFetching = false,
  disabled = false,
  className = "",
}) => {
  const maxPage = Math.max(1, Math.min(totalPages, TMDB_MAX_PAGE));
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= maxPage;

  // ── Direct page input state ───────────────────────────────────────────────
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [prevCurrentPage, setPrevCurrentPage] = useState(currentPage);

  // Sync input when currentPage changes externally (buttons or URL)
  if (prevCurrentPage !== currentPage) {
    setPrevCurrentPage(currentPage);
    setPageInput(String(currentPage));
  }

  const handlePageChange = (page) => {
    const clamped = Math.max(1, Math.min(page, maxPage));
    if (clamped !== currentPage) {
      onPageChange(clamped);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const commitPageInput = () => {
    const parsed = Number.parseInt(pageInput.trim(), 10);
    if (Number.isFinite(parsed)) {
      const clamped = Math.max(1, Math.min(parsed, maxPage));
      setPageInput(String(clamped));
      if (clamped !== currentPage) {
        onPageChange(clamped);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Revert to current page if invalid
      setPageInput(String(currentPage));
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow only digits, max 4 chars
    if (val === "" || /^\d{1,4}$/.test(val)) {
      setPageInput(val);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitPageInput();
      e.target.blur();
    } else if (e.key === "Escape") {
      setPageInput(String(currentPage));
      e.target.blur();
    }
  };

  if (maxPage <= 1) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 pointer-events-auto ${className}`}
    >
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full border border-border/80 bg-card/90 dark:bg-card/85 backdrop-blur-md shadow-2xl ring-1 ring-foreground/10"
      >
        {/* First Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={disabled || isFirstPage}
          aria-label="Go to first page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-30 cursor-pointer"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || isFirstPage}
          aria-label="Go to previous page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Direct Page Input & Total */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full bg-muted/40 border border-border/50 text-xs sm:text-sm">
          <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline select-none">
            Page
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={handleInputChange}
            onBlur={commitPageInput}
            onKeyDown={handleInputKeyDown}
            aria-label={`Current page ${currentPage} of ${maxPage}. Type a page number and press Enter to jump.`}
            title="Type a page number and press Enter"
            className="w-10 sm:w-12 h-6 sm:h-7 rounded-md bg-background/90 text-center font-semibold text-foreground border border-input focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
          />
          <span className="text-muted-foreground select-none font-medium text-xs sm:text-sm">
            / {maxPage.toLocaleString()}
          </span>
          {isFetching && (
            <Loader2 className="h-3 w-3 animate-spin text-primary ml-0.5" />
          )}
        </div>

        {/* Next Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || isLastPage}
          aria-label="Go to next page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(maxPage)}
          disabled={disabled || isLastPage}
          aria-label="Go to last page"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 disabled:opacity-30 cursor-pointer"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};
