import { useState, useEffect, useRef, useMemo } from "react";
import { SlidersHorizontal, RotateCcw, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** TMDB sort options exposed to the user */
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "revenue.desc", label: "Highest Revenue" },
];

/**
 * FilterBar — Genre, Year, Sort controls for the Discover page.
 *
 * @param {object} props
 * @param {Array<{ id: number, name: string }>} props.genres
 * @param {string} props.selectedGenre
 * @param {string} props.selectedYear
 * @param {string} props.selectedSort
 * @param {(genreId: string) => void} props.onGenreChange
 * @param {(year: string) => void} props.onYearChange
 * @param {(sortKey: string) => void} props.onSortChange
 * @param {() => void} props.onReset
 * @param {boolean} props.hasActiveFilters
 * @param {boolean} props.isFetching
 * @param {number} [props.totalResults]
 */
export const FilterBar = ({
  genres,
  selectedGenre,
  selectedYear,
  selectedSort,
  onGenreChange,
  onYearChange,
  onSortChange,
  onReset,
  hasActiveFilters,
  isFetching,
  totalResults,
}) => {
  // ── Debounced year input ──────────────────────────────────────────────────
  const [prevSelectedYear, setPrevSelectedYear] = useState(selectedYear);
  const [yearDraft, setYearDraft] = useState(selectedYear);
  const debounceRef = useRef(null);

  // Keep draft in sync when URL param changes externally (back/forward nav or reset)
  if (prevSelectedYear !== selectedYear) {
    setPrevSelectedYear(selectedYear);
    setYearDraft(selectedYear);
  }

  const commitYear = (value) => {
    const trimmed = value.trim();
    if (trimmed === selectedYear) return;

    if (trimmed === "") {
      onYearChange("");
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isFinite(parsed) && parsed >= 1888 && parsed <= 2100) {
      onYearChange(String(parsed));
    }
  };

  const handleYearInput = (e) => {
    const value = e.target.value;
    // Allow only digits, max 4 characters
    if (value !== "" && !/^\d{0,4}$/.test(value)) return;
    setYearDraft(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitYear(value), 400);
  };

  const handleYearKeyDown = (e) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      commitYear(yearDraft);
    }
  };

  const handleYearBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitYear(yearDraft);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Genre items & lookup ─────────────────────────────────────────────────
  const genreItems = useMemo(() => {
    return [
      { value: "all", label: "All Genres" },
      ...genres.map((g) => ({ value: String(g.id), label: g.name })),
    ];
  }, [genres]);

  const currentGenreLabel = useMemo(() => {
    if (!selectedGenre || selectedGenre === "all") return "All Genres";
    const match = genres.find((g) => String(g.id) === String(selectedGenre));
    return match ? match.name : "All Genres";
  }, [genres, selectedGenre]);

  const currentSortLabel = useMemo(() => {
    const match = SORT_OPTIONS.find((opt) => opt.value === selectedSort);
    return match ? match.label : "Most Popular";
  }, [selectedSort]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeCount =
    (selectedGenre ? 1 : 0) +
    (selectedYear ? 1 : 0) +
    (selectedSort !== "popularity.desc" ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm transition-colors">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 text-primary border-primary/20 bg-primary/5 font-semibold"
            >
              {activeCount}
            </Badge>
          )}
          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {totalResults != null && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
            </span>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Genre Select */}
        <div className="space-y-1.5">
          <label
            htmlFor="discover-genre"
            className="text-xs font-medium text-muted-foreground"
          >
            Genre
          </label>
          <Select
            value={selectedGenre || "all"}
            onValueChange={(val) => onGenreChange(val === "all" ? "" : val)}
            items={genreItems}
          >
            <SelectTrigger id="discover-genre" className="h-9 w-full">
              <SelectValue placeholder="All Genres">
                {currentGenreLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-64">
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="discover-year"
            className="text-xs font-medium text-muted-foreground"
          >
            Release Year
          </label>
          <div className="relative">
            <Input
              id="discover-year"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2024"
              maxLength={4}
              value={yearDraft}
              onChange={handleYearInput}
              onKeyDown={handleYearKeyDown}
              onBlur={handleYearBlur}
              className="h-9 pr-8"
            />
            {yearDraft && (
              <button
                type="button"
                onClick={() => {
                  setYearDraft("");
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  onYearChange("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear year filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort Select */}
        <div className="space-y-1.5">
          <label
            htmlFor="discover-sort"
            className="text-xs font-medium text-muted-foreground"
          >
            Sort By
          </label>
          <Select
            value={selectedSort || "popularity.desc"}
            onValueChange={(val) => onSortChange(val)}
            items={SORT_OPTIONS}
          >
            <SelectTrigger id="discover-sort" className="h-9 w-full">
              <SelectValue placeholder="Most Popular">
                {currentSortLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="max-h-64">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
