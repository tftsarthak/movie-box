import { Link } from "react-router";
import { Film, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground mb-6">
        <Film className="h-7 w-7" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl mb-3">
        404
      </h1>
      <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
        The reel you are looking for does not exist or has been moved to another projector.
      </p>
      <Link to="/">
        <Button className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-4 py-2">
          <Home className="h-4 w-4 mr-1.5" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
