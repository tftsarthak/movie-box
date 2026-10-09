import { useState, useEffect } from "react";
import { getTrendingMovies } from "@/api/movieApi";
import { HeroBanner } from "@/components/movie/HeroBanner";
import { MovieCarousel } from "@/components/movie/MovieCarousel";
import { ErrorState } from "@/components/common/ErrorState";

export const HomePage = () => {
  const [dailyTrending, setDailyTrending] = useState([]);
  const [weeklyTrending, setWeeklyTrending] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          getTrendingMovies("day", 1),
          getTrendingMovies("week", 1),
        ]);

        if (!ignore) {
          const dailyList = dailyRes?.results || [];
          const weeklyList = weeklyRes?.results || [];

          setDailyTrending(dailyList);
          setWeeklyTrending(weeklyList);

          // Select featured spotlight movie with valid backdrop & poster
          const featured =
            dailyList.find((m) => m.backdrop_path && m.poster_path) || dailyList[0];
          setHeroMovie(featured || null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching homepage trending data:", err);
          setError(err.message || "Failed to load trending movies. Please try again.");
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      getTrendingMovies("day", 1),
      getTrendingMovies("week", 1),
    ])
      .then(([dailyRes, weeklyRes]) => {
        const dailyList = dailyRes?.results || [];
        const weeklyList = weeklyRes?.results || [];
        setDailyTrending(dailyList);
        setWeeklyTrending(weeklyList);
        const featured =
          dailyList.find((m) => m.backdrop_path && m.poster_path) || dailyList[0];
        setHeroMovie(featured || null);
      })
      .catch((err) => {
        console.error("Retry error:", err);
        setError(err.message || "Failed to load trending movies. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (error && dailyTrending.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <ErrorState
          title="Could not load trending films"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Spotlight */}
      <HeroBanner movie={heroMovie} isLoading={isLoading} />

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto space-y-4 pt-4 sm:pt-6">
        {/* Trending Today Carousel */}
        <MovieCarousel
          title="Trending Today"
          subtitle="Top movies capturing audiences worldwide today"
          movies={dailyTrending}
          isLoading={isLoading}
          viewAllHref="/discover?sort_by=popularity.desc"
        />

        {/* Trending This Week Carousel */}
        <MovieCarousel
          title="Trending This Week"
          subtitle="The biggest hits and most-watched films of the week"
          movies={weeklyTrending}
          isLoading={isLoading}
          viewAllHref="/discover?sort_by=popularity.desc"
        />
      </div>
    </div>
  );
};

export default HomePage;
