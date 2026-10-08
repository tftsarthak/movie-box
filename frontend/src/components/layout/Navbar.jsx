import { Link, NavLink } from "react-router";
import { Film, Search, Compass, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
      isActive
        ? "text-foreground bg-muted font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff5757] to-[#a1131a] text-white shadow-sm">
              <Film className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Movie<span className="text-[#ff6161]">Box</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/discover" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Discover
              </span>
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Search
              </span>
            </NavLink>
          </nav>
        </div>

        {/* Right Section: Search Icon on Mobile + Theme Toggle + Auth */}
        <div className="flex items-center gap-2.5">
          <Link to="/search" className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 border border-border bg-card text-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <ThemeToggle />

          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogIn className="h-3.5 w-3.5 mr-1" />
              Sign In
            </Button>
          </Link>

          <Link to="/signup">
            <Button
              size="sm"
              className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
