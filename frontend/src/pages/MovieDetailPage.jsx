import { useParams, Link } from "react-router";
import { Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MovieDetailPage = () => {
  const { tmdbId } = useParams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-block mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Overview
        </Button>
      </Link>

      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground transition-colors shadow-sm">
        <Film className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-60" />
        <h2 className="text-xl font-bold text-foreground mb-2">Movie #{tmdbId}</h2>
        <p className="text-sm">
          Movie details, cast credits, and similar films will be connected in Phase 3.
        </p>
      </div>
    </div>
  );
};
