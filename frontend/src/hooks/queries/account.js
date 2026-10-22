import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getMovieAccountStates,
  toggleFavorite,
  toggleWatchlist,
} from "@/api/accountApi";

// ─── Query Key Factory ──────────────────────────────────────────────────────
export const accountKeys = {
  all: () => ["account"],
  movieState: (movieId) => [...accountKeys.all(), "states", "movie", String(movieId)],
  favorites: (type = "movies") => [...accountKeys.all(), "favorites", type],
  watchlist: (type = "movies") => [...accountKeys.all(), "watchlist", type],
};

// ─── Queries ────────────────────────────────────────────────────────────────
/**
 * Hook to fetch the authenticated user's interaction state for a movie (favorite, watchlist, rating)
 * @param {string|number} movieId
 * @param {{ enabled?: boolean }} [options]
 */
export const useMovieAccountState = (movieId, options = {}) =>
  useQuery({
    queryKey: accountKeys.movieState(movieId),
    queryFn: ({ signal }) => getMovieAccountStates(movieId, { signal }),
    enabled: Boolean(movieId && options.enabled),
    select: (data) => ({
      favorite: Boolean(data?.favorite),
      watchlist: Boolean(data?.watchlist),
      rated: data?.rated ?? false,
    }),
  });

// ─── Mutations ──────────────────────────────────────────────────────────────
/**
 * Mutation to toggle a movie's favorite status with optimistic UI updates
 */
export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, favorite }) =>
      toggleFavorite({ media_type: "movie", media_id: movieId, favorite }),

    onMutate: async ({ movieId, favorite }) => {
      const stateKey = accountKeys.movieState(movieId);
      await queryClient.cancelQueries({ queryKey: stateKey });
      const previousState = queryClient.getQueryData(stateKey);

      // Optimistically update account state
      queryClient.setQueryData(stateKey, (old) => ({
        ...old,
        favorite,
      }));

      return { previousState, stateKey };
    },

    onError: (err, { favorite }, context) => {
      if (context?.stateKey && context.previousState) {
        queryClient.setQueryData(context.stateKey, context.previousState);
      }
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${favorite ? "add to" : "remove from"} favorites`
      );
    },

    onSuccess: (_, { favorite }) => {
      toast.success(
        favorite ? "Added to your favorites" : "Removed from your favorites"
      );
    },

    onSettled: (_, __, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.movieState(movieId) });
      queryClient.invalidateQueries({ queryKey: accountKeys.favorites("movies") });
    },
  });
};

/**
 * Mutation to toggle a movie's watchlist status with optimistic UI updates
 */
export const useToggleWatchlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, watchlist }) =>
      toggleWatchlist({ media_type: "movie", media_id: movieId, watchlist }),

    onMutate: async ({ movieId, watchlist }) => {
      const stateKey = accountKeys.movieState(movieId);
      await queryClient.cancelQueries({ queryKey: stateKey });
      const previousState = queryClient.getQueryData(stateKey);

      // Optimistically update account state
      queryClient.setQueryData(stateKey, (old) => ({
        ...old,
        watchlist,
      }));

      return { previousState, stateKey };
    },

    onError: (err, { watchlist }, context) => {
      if (context?.stateKey && context.previousState) {
        queryClient.setQueryData(context.stateKey, context.previousState);
      }
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${watchlist ? "add to" : "remove from"} watchlist`
      );
    },

    onSuccess: (_, { watchlist }) => {
      toast.success(
        watchlist ? "Added to your watchlist" : "Removed from your watchlist"
      );
    },

    onSettled: (_, __, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.movieState(movieId) });
      queryClient.invalidateQueries({ queryKey: accountKeys.watchlist("movies") });
    },
  });
};
