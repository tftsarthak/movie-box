import { Link, NavLink, useNavigate } from "react-router";
import {
  Film,
  Search,
  Compass,
  LogIn,
  LogOut,
  LayoutDashboard,
  Heart,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCognitoAuth } from "@/hooks/useCognitoAuth";
import { TMDB_IMAGE_BASE_URL } from "@/lib/constants";

export const Navbar = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const {
    isAuthenticated: isCognitoAuth,
    email: cognitoEmail,
    signOut: cognitoSignOut,
    isLoading: cognitoLoading,
  } = useCognitoAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${
      isActive
        ? "text-foreground bg-muted font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  const handleLogout = async () => {
    try {
      if (!isCognitoAuth) {
        navigate("/", { replace: true });
      }
      await logout();
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const hasAnyAuth = isAuthenticated || isCognitoAuth;
  const isAuthLoading = loading || cognitoLoading;

  const avatarPath = user?.avatar?.tmdb?.avatar_path;
  const gravatarHash = user?.avatar?.gravatar?.hash;
  const avatarUrl = avatarPath
    ? `${TMDB_IMAGE_BASE_URL.profile}${avatarPath}`
    : gravatarHash
    ? `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`
    : null;

  const displayName =
    user?.name?.trim() ||
    user?.username ||
    cognitoEmail?.split("@")[0] ||
    "Account";
  const initials = (user?.username || cognitoEmail || "U")
    .slice(0, 2)
    .toUpperCase();

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

        {/* Right Section: Mobile Search + Theme Toggle + Auth Status */}
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

          {isAuthLoading ? (
            <div className="h-9 w-20 rounded-md bg-muted/60 animate-pulse border border-border/50" />
          ) : hasAnyAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pl-1.5 pr-2.5 text-xs font-medium border border-border bg-card hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-7 w-7 rounded-full object-cover border border-border/80"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px] border border-primary/20">
                    {initials}
                  </span>
                )}
                <span className="hidden sm:inline-block max-w-[120px] truncate text-foreground font-semibold">
                  {displayName}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 shadow-xl border border-border bg-popover"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1.5 font-normal">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {displayName}
                      </p>
                      {user?.username && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{user?.username}
                        </p>
                      )}
                      {cognitoEmail && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {cognitoEmail}
                        </p>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {isCognitoAuth && (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          MovieBox Account
                        </span>
                      )}
                      {isAuthenticated && (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          TMDB Connected
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={<Link to="/dashboard" className="cursor-pointer" />}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link to="/favorites" className="cursor-pointer" />}
                  >
                    <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link to="/watchlist" className="cursor-pointer" />}
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Watchlist</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {isCognitoAuth && (
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={cognitoSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out of MovieBox</span>
                  </DropdownMenuItem>
                )}
                {isAuthenticated && (
                  <DropdownMenuItem
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Disconnect TMDB</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
