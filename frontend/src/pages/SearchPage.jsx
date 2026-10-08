import { Search } from "lucide-react";

export const SearchPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Search Movies
        </h1>
        <p className="text-sm text-muted-foreground">
          Find your favorite movies by title, actor, or franchise.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground transition-colors shadow-sm">
        <Search className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-60" />
        <p className="text-sm">Search functionality will be connected in Phase 4.</p>
      </div>
    </div>
  );
};
