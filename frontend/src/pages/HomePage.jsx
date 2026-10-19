import { useMemo } from "react";
import { useTrendingMovies } from "@/hooks/queries/movies";
import { HeroBanner } from "@/components/movie/HeroBanner";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import { ErrorState } from "@/components/common/ErrorState";

export const HomePage = () => {
  const daily = useTrendingMovies("day");
  const weekly = useTrendingMovies("week");

  const dailyTrending = daily.data || [];
  const weeklyTrending = weekly.data || [];

  const heroMovie = useMemo(() => {
    const list = daily.data;
    if (!list?.length) return null;
    return list.find((m) => m.backdrop_path && m.poster_path) || list[0] || null;
  }, [daily.data]);

  const isError = daily.isError || weekly.isError;
  const errorMessage =
    daily.error?.message ||
    weekly.error?.message ||
    "Failed to load trending movies. Please try again.";

  const handleRetry = () => {
    if (daily.isError) daily.refetch();
    if (weekly.isError) weekly.refetch();
  };

  if (isError && dailyTrending.length === 0 && weeklyTrending.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <ErrorState
          title="Could not load trending films"
          message={errorMessage}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Spotlight */}
      <HeroBanner movie={heroMovie} isLoading={daily.isLoading} />

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto space-y-4 pt-4 sm:pt-6">
        {/* Trending Today Carousel */}
        <MovieCarousel
          title="Trending Today"
          subtitle="Top movies capturing audiences worldwide today"
          movies={dailyTrending}
          isLoading={daily.isLoading}
          viewAllHref="/discover?sort_by=popularity.desc"
        />

        {/* Trending This Week Carousel */}
        <MovieCarousel
          title="Trending This Week"
          subtitle="The biggest hits and most-watched films of the week"
          movies={weeklyTrending}
          isLoading={weekly.isLoading}
          viewAllHref="/discover?sort_by=popularity.desc"
        />
      </div>
    </div>
  );
};

export default HomePage;
