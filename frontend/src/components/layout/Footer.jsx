import { Film, Heart } from "lucide-react";
import { Link } from "react-router";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12 text-muted-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#ff5757] to-[#a1131a] text-white">
                <Film className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">MovieBox</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm text-center md:text-left">
              Discover trending films, browse genres, search catalog, and manage your watchlist.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/discover" className="hover:text-foreground transition-colors">
              Discover
            </Link>
            <Link to="/search" className="hover:text-foreground transition-colors">
              Search
            </Link>
          </div>

          {/* TMDB attribution & license */}
          <div className="flex flex-col items-center md:items-end gap-1 text-[11px] text-muted-foreground">
            <p>
              Data provided by{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline hover:text-primary transition-colors"
              >
                TMDB
              </a>
              . Not endorsed or certified by TMDB.
            </p>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for cinema lovers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
