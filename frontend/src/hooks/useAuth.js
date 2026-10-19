import { useQueryClient } from "@tanstack/react-query";
import { useUser, useLogin, useLogout, authKeys } from "@/hooks/queries/auth";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, error: queryError } = useUser();
  const { login, error: loginError } = useLogin();
  const logoutMutation = useLogout();

  return {
    user: user ?? null,
    isAuthenticated: Boolean(user),
    loading,
    error: loginError || queryError?.message || null,
    login,
    logout: logoutMutation.mutateAsync,
    checkAuth: (options) => queryClient.refetchQueries({ queryKey: authKeys.user(), ...options }),
    setUser: (userData) => queryClient.setQueryData(authKeys.user(), userData),
  };
};

export default useAuth;
