import { Compass } from "lucide-react";

export const DiscoverPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Discover Catalog
        </h1>
        <p className="text-sm text-muted-foreground">
          Filter movies by genre, release year, or sort by popularity and rating.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground transition-colors shadow-sm">
        <Compass className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-60" />
        <p className="text-sm">Catalog filters and pagination will be active in Phase 4.</p>
      </div>
    </div>
  );
};
